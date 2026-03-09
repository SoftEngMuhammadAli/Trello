const { Server } = require('socket.io');
const { verifyAccessToken } = require('../services/token.service');

function initSocket(server, clientUrl) {
  const io = new Server(server, {
    cors: {
      origin: clientUrl,
      credentials: true,
    },
  });

  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token || socket.handshake.query?.token;
      if (!token) return next(new Error('Unauthorized'));
      const payload = verifyAccessToken(token);
      socket.userId = payload.sub;
      next();
    } catch (error) {
      next(new Error('Unauthorized'));
    }
  });

  io.on('connection', (socket) => {
    socket.join(`user:${socket.userId}`);

    socket.on('board:join', (boardId) => {
      socket.join(`board:${boardId}`);
    });

    socket.on('board:leave', (boardId) => {
      socket.leave(`board:${boardId}`);
    });

    socket.on('disconnect', () => {
      // socket lifecycle cleanup is handled by socket.io internally.
    });
  });

  return io;
}

module.exports = initSocket;
