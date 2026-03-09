import http from 'http';
import app from './app.js';
import env from './config/env.js';
import connectDb from './config/db.js';
import initSocket from './sockets/index.js';

async function bootstrap() {
  await connectDb();

  const server = http.createServer(app);
  const io = initSocket(server, env.clientUrl);
  app.locals.io = io;

  server.listen(env.port, () => {
    console.log(`Server listening on port ${env.port}`);
  });
}

bootstrap().catch((error) => {
  console.error('Failed to start server', error);
  process.exit(1);
});