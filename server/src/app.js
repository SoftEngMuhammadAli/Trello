import path from 'path';
import fs from 'fs';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import hpp from 'hpp';
import xssClean from 'xss-clean';
import mongoSanitize from 'express-mongo-sanitize';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';
import env from './config/env.js';
import swaggerSpec from './config/swagger.js';
import routes from './routes/index.js';
import { notFound, errorHandler } from './middleware/error.middleware.js';

const app = express();

const uploadsPath = path.resolve(process.cwd(), env.uploadDir);
if (!fs.existsSync(uploadsPath)) {
  fs.mkdirSync(uploadsPath, { recursive: true });
}

app.use(
  cors({
    origin: env.clientUrl,
    credentials: true,
  }),
);

app.use(helmet());
app.use(hpp());
app.use(xssClean());
app.use(mongoSanitize());

app.use(
  rateLimit({
    windowMs: env.rateLimitWindowMinutes * 60 * 1000,
    max: env.rateLimitMax,
    standardHeaders: true,
    legacyHeaders: false,
  }),
);

app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

if (env.nodeEnv !== 'test') {
  app.use(morgan('dev'));
}

app.use(`/${env.uploadDir}`, express.static(uploadsPath));
app.get('/health', (_req, res) => res.json({ success: true, status: 'ok' }));
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, { explorer: true }));
app.get('/api/docs.json', (_req, res) => res.json(swaggerSpec));
app.use('/api', routes);

app.use(notFound);
app.use(errorHandler);

export default app;
