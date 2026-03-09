const { StatusCodes } = require('http-status-codes');
const Comment = require('../models/Comment');
const Card = require('../models/Card');
const Board = require('../models/Board');
const Workspace = require('../models/Workspace');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { pushBoardActivity } = require('../services/activity.service');
const { emitBoardEvent } = require('../services/socket.service');

async function assertCardBoardAccess(cardId, userId) {
  const card = await Card.findById(cardId);
  if (!card) throw new ApiError(StatusCodes.NOT_FOUND, 'Card not found');

  const board = await Board.findById(card.boardId);
  const workspace = await Workspace.findById(board.workspaceId).select('members');

  const isBoardMember = board.members.some((memberId) => memberId.toString() === userId.toString());
  const workspaceMember = workspace.members.find((member) => member.userId.toString() === userId.toString());

  if (!isBoardMember && !workspaceMember) {
    throw new ApiError(StatusCodes.FORBIDDEN, 'Board access denied');
  }

  return { card, board, workspaceMember };
}

const createComment = asyncHandler(async (req, res) => {
  const { card, board } = await assertCardBoardAccess(req.body.cardId, req.user._id);

  const comment = await Comment.create({
    cardId: card._id,
    userId: req.user._id,
    text: req.body.text,
  });

  await Card.findByIdAndUpdate(card._id, { $addToSet: { comments: comment._id } });
  await pushBoardActivity(board._id, 'comment.created', req.user._id, {
    cardId: card._id,
    commentId: comment._id,
  });

  const populated = await Comment.findById(comment._id).populate('userId', 'name avatar');
  emitBoardEvent(req, board._id.toString(), 'comment:created', { comment: populated });

  res.status(StatusCodes.CREATED).json({ success: true, comment: populated });
});

const getComments = asyncHandler(async (req, res) => {
  const { cardId } = req.query;
  if (!cardId) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'cardId query parameter is required');
  }

  await assertCardBoardAccess(cardId, req.user._id);
  const comments = await Comment.find({ cardId })
    .sort({ createdAt: -1 })
    .populate('userId', 'name avatar');

  res.json({ success: true, data: comments });
});

const updateComment = asyncHandler(async (req, res) => {
  const comment = await Comment.findById(req.params.id);
  if (!comment) throw new ApiError(StatusCodes.NOT_FOUND, 'Comment not found');

  const { board, workspaceMember } = await assertCardBoardAccess(comment.cardId, req.user._id);
  const isOwner = comment.userId.toString() === req.user._id.toString();
  const isAdmin = workspaceMember && workspaceMember.role === 'admin';

  if (!isOwner && !isAdmin) {
    throw new ApiError(StatusCodes.FORBIDDEN, 'You cannot edit this comment');
  }

  comment.text = req.body.text;
  await comment.save();

  const populated = await Comment.findById(comment._id).populate('userId', 'name avatar');
  emitBoardEvent(req, board._id.toString(), 'comment:updated', { comment: populated });
  res.json({ success: true, comment: populated });
});

const deleteComment = asyncHandler(async (req, res) => {
  const comment = await Comment.findById(req.params.id);
  if (!comment) throw new ApiError(StatusCodes.NOT_FOUND, 'Comment not found');

  const { board, workspaceMember, card } = await assertCardBoardAccess(comment.cardId, req.user._id);
  const isOwner = comment.userId.toString() === req.user._id.toString();
  const isAdmin = workspaceMember && workspaceMember.role === 'admin';

  if (!isOwner && !isAdmin) {
    throw new ApiError(StatusCodes.FORBIDDEN, 'You cannot delete this comment');
  }

  await Promise.all([
    Comment.deleteOne({ _id: comment._id }),
    Card.findByIdAndUpdate(card._id, { $pull: { comments: comment._id } }),
  ]);

  await pushBoardActivity(board._id, 'comment.deleted', req.user._id, {
    cardId: card._id,
    commentId: comment._id,
  });

  emitBoardEvent(req, board._id.toString(), 'comment:deleted', { commentId: comment._id, cardId: card._id });
  res.json({ success: true, message: 'Comment deleted successfully' });
});

module.exports = {
  createComment,
  getComments,
  updateComment,
  deleteComment,
};
