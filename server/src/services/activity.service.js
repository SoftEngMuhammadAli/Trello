const Board = require('../models/Board');

async function pushBoardActivity(boardId, action, userId, meta = {}) {
  await Board.findByIdAndUpdate(boardId, {
    $push: {
      activityLog: {
        action,
        userId,
        meta,
        createdAt: new Date(),
      },
    },
  });
}

module.exports = { pushBoardActivity };
