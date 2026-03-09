function emitBoardEvent(req, boardId, event, payload) {
  if (!req.app.locals.io) return;
  req.app.locals.io.to(`board:${boardId}`).emit(event, payload);
}

module.exports = { emitBoardEvent };
