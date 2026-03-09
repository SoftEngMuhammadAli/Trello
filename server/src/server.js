const http = require('http');
const app = require('./app');
const env = require('./config/env');
const connectDb = require('./config/db');
const initSocket = require('./sockets');

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
