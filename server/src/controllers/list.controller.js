const { StatusCodes } = require('http-status-codes');
const Board = require('../models/Board');
const List = require('../models/List');
const Card = require('../models/Card');
const Comment = require('../models/Comment');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { pushBoardActivity } = require('../services/activity.service');
const { emitBoardEvent } = require('../services/socket.service');

async function getBoardAndAssertMember(boardId, userId) {
  const board = await Board.findById(boardId).populate('workspaceId', 'members');
  if (!board) throw new ApiError(StatusCodes.NOT_FOUND, 'Board not found');

  const isBoardMember = board.members.some((memberId) => memberId.toString() === userId.toString());
  const isWorkspaceMember = board.workspaceId.members.some(
    (member) => member.userId.toString() === userId.toString(),
  );

  if (!isBoardMember && !isWorkspaceMember) {
    throw new ApiError(StatusCodes.FORBIDDEN, 'Board access denied');
  }

  return board;
}

const createList = asyncHandler(async (req, res) => {
  const { boardId, title, position } = req.body;
  const board = await getBoardAndAssertMember(boardId, req.user._id);

  let targetPosition = position;
  if (targetPosition === undefined) {
    const lastList = await List.findOne({ boardId }).sort({ position: -1 }).select('position');
    targetPosition = lastList ? lastList.position + 1 : 0;
  }

  const list = await List.create({ boardId, title, position: targetPosition, cards: [] });
  await Board.findByIdAndUpdate(board._id, { $addToSet: { lists: list._id } });
  await pushBoardActivity(board._id, 'list.created', req.user._id, { listId: list._id, title });
  emitBoardEvent(req, board._id.toString(), 'list:created', { list });

  res.status(StatusCodes.CREATED).json({ success: true, list });
});

const updateList = asyncHandler(async (req, res) => {
  const list = await List.findById(req.params.id);
  if (!list) throw new ApiError(StatusCodes.NOT_FOUND, 'List not found');

  const board = await getBoardAndAssertMember(list.boardId, req.user._id);
  list.title = req.body.title;
  await list.save();

  await pushBoardActivity(board._id, 'list.updated', req.user._id, { listId: list._id, title: list.title });
  emitBoardEvent(req, board._id.toString(), 'list:updated', { list });

  res.json({ success: true, list });
});

const updateListPosition = asyncHandler(async (req, res) => {
  const list = await List.findById(req.params.id);
  if (!list) throw new ApiError(StatusCodes.NOT_FOUND, 'List not found');
  const board = await getBoardAndAssertMember(list.boardId, req.user._id);

  const lists = await List.find({ boardId: list.boardId }).sort({ position: 1 });
  const movingList = lists.find((item) => item._id.toString() === list._id.toString());
  const nextLists = lists.filter((item) => item._id.toString() !== list._id.toString());

  const safePosition = Math.max(0, Math.min(req.body.position, nextLists.length));
  nextLists.splice(safePosition, 0, movingList);

  await Promise.all(
    nextLists.map((item, index) =>
      List.updateOne(
        { _id: item._id },
        {
          $set: { position: index },
        },
      ),
    ),
  );

  await pushBoardActivity(board._id, 'list.reordered', req.user._id, {
    listId: list._id,
    position: safePosition,
  });
  emitBoardEvent(req, board._id.toString(), 'list:reordered', {
    listId: list._id,
    position: safePosition,
  });

  res.json({ success: true, message: 'List position updated' });
});

const deleteList = asyncHandler(async (req, res) => {
  const list = await List.findById(req.params.id);
  if (!list) throw new ApiError(StatusCodes.NOT_FOUND, 'List not found');
  const board = await getBoardAndAssertMember(list.boardId, req.user._id);

  const cards = await Card.find({ listId: list._id }).select('_id');
  const cardIds = cards.map((card) => card._id);

  await Promise.all([
    Comment.deleteMany({ cardId: { $in: cardIds } }),
    Card.deleteMany({ _id: { $in: cardIds } }),
    List.deleteOne({ _id: list._id }),
    Board.findByIdAndUpdate(board._id, { $pull: { lists: list._id } }),
  ]);

  await pushBoardActivity(board._id, 'list.deleted', req.user._id, { listId: list._id });
  emitBoardEvent(req, board._id.toString(), 'list:deleted', { listId: list._id });

  res.json({ success: true, message: 'List deleted successfully' });
});

module.exports = {
  createList,
  updateList,
  updateListPosition,
  deleteList,
};
