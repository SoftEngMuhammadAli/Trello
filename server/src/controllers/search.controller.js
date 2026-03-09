const { StatusCodes } = require('http-status-codes');
const Board = require('../models/Board');
const Workspace = require('../models/Workspace');
const List = require('../models/List');
const Card = require('../models/Card');
const Comment = require('../models/Comment');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

const search = asyncHandler(async (req, res) => {
  const { q, boardId } = req.query;
  const board = await Board.findById(boardId);
  if (!board) throw new ApiError(StatusCodes.NOT_FOUND, 'Board not found');

  const workspace = await Workspace.findById(board.workspaceId).select('members');
  const isBoardMember = board.members.some((memberId) => memberId.toString() === req.user._id.toString());
  const isWorkspaceMember = workspace.members.some(
    (member) => member.userId.toString() === req.user._id.toString(),
  );

  if (!isBoardMember && !isWorkspaceMember) {
    throw new ApiError(StatusCodes.FORBIDDEN, 'Board access denied');
  }

  const pattern = new RegExp(escapeRegex(q), 'i');
  const listIds = (await List.find({ boardId }).select('_id')).map((list) => list._id);

  const [lists, cards, comments] = await Promise.all([
    List.find({ boardId, title: pattern }).select('_id title boardId position').limit(20),
    Card.find({ boardId, archived: false, $or: [{ title: pattern }, { description: pattern }] })
      .select('_id title description listId position labels dueDate members')
      .limit(50),
    Comment.find({ text: pattern, cardId: { $in: (await Card.find({ listId: { $in: listIds } }).select('_id')).map((c) => c._id) } })
      .populate('userId', 'name avatar')
      .select('_id text cardId userId createdAt')
      .limit(20),
  ]);

  res.json({
    success: true,
    results: {
      lists,
      cards,
      comments,
    },
  });
});

module.exports = { search };
