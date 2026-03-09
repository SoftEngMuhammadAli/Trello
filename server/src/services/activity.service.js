import Board from '../models/Board.js';

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

export { pushBoardActivity };