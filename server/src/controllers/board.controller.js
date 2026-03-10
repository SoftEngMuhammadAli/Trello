import { StatusCodes } from 'http-status-codes';
import Workspace from '../models/Workspace.js';
import Board from '../models/Board.js';
import List from '../models/List.js';
import Card from '../models/Card.js';
import Comment from '../models/Comment.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';
import { getPagination } from '../utils/pagination.js';
import { pushBoardActivity } from '../services/activity.service.js';
import { emitBoardEvent } from '../services/socket.service.js';

async function assertWorkspaceMember(workspaceId, userId) {
  const workspace = await Workspace.findById(workspaceId).select('members');
  if (!workspace) throw new ApiError(StatusCodes.NOT_FOUND, 'Workspace not found');
  const isMember = workspace.members.some((member) => member.userId.toString() === userId.toString());
  if (!isMember) throw new ApiError(StatusCodes.FORBIDDEN, 'Workspace access denied');
  return workspace;
}

const createBoard = asyncHandler(async (req, res) => {
  const { workspaceId, title, background, members } = req.body;
  await assertWorkspaceMember(workspaceId, req.user._id);

  const uniqueMembers = new Set([req.user._id.toString(), ...(members || [])]);

  const board = await Board.create({
    workspaceId,
    title,
    background: background || { type: 'gradient', value: 'linear-gradient(120deg, #0b78de, #14b8a6)' },
    members: [...uniqueMembers],
    activityLog: [
      {
        action: 'board.created',
        userId: req.user._id,
        meta: { title },
      },
    ],
  });

  await Workspace.findByIdAndUpdate(workspaceId, { $addToSet: { boards: board._id } });
  emitBoardEvent(req, board._id.toString(), 'board:updated', { boardId: board._id, action: 'created' });

  res.status(StatusCodes.CREATED).json({ success: true, board });
});

const getBoards = asyncHandler(async (req, res) => {
  const { workspaceId } = req.query;
  if (!workspaceId) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'workspaceId query parameter is required');
  }

  await assertWorkspaceMember(workspaceId, req.user._id);
  const { page, limit, skip } = getPagination(req.query);

  const [boards, total] = await Promise.all([
    Board.find({ workspaceId }).sort({ updatedAt: -1 }).skip(skip).limit(limit),
    Board.countDocuments({ workspaceId }),
  ]);

  res.json({
    success: true,
    data: boards,
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
});

const getBoard = asyncHandler(async (req, res) => {
  const board = await Board.findById(req.params.id).populate('members', 'name email avatar');
  if (!board) throw new ApiError(StatusCodes.NOT_FOUND, 'Board not found');

  await assertWorkspaceMember(board.workspaceId, req.user._id);
  res.json({ success: true, board });
});

const getBoardFull = asyncHandler(async (req, res) => {
  const board = await Board.findById(req.params.id)
    .populate('members', 'name email avatar')
    .populate('activityLog.userId', 'name email avatar');

  if (!board) throw new ApiError(StatusCodes.NOT_FOUND, 'Board not found');
  await assertWorkspaceMember(board.workspaceId, req.user._id);

  const lists = await List.find({ boardId: board._id }).sort({ position: 1 }).lean();
  const listIds = lists.map((list) => list._id);
  const cards = await Card.find({ listId: { $in: listIds } })
    .sort({ position: 1 })
    .populate('members', 'name email avatar')
    .lean();

  const cardIds = cards.map((card) => card._id);
  const comments = await Comment.find({ cardId: { $in: cardIds } })
    .sort({ createdAt: -1 })
    .populate('userId', 'name avatar')
    .lean();

  const commentsByCard = comments.reduce((acc, comment) => {
    const key = comment.cardId.toString();
    if (!acc[key]) acc[key] = [];
    acc[key].push(comment);
    return acc;
  }, {});

  const cardsByList = cards.reduce((acc, card) => {
    const key = card.listId.toString();
    if (!acc[key]) acc[key] = [];
    acc[key].push({
      ...card,
      commentsData: commentsByCard[card._id.toString()] || [],
    });
    return acc;
  }, {});

  const listsWithCards = lists.map((list) => ({
    ...list,
    cardsData: cardsByList[list._id.toString()] || [],
  }));

  res.json({
    success: true,
    board: {
      ...board.toObject(),
      listsData: listsWithCards,
    },
  });
});

const updateBoard = asyncHandler(async (req, res) => {
  const board = await Board.findById(req.params.id);
  if (!board) throw new ApiError(StatusCodes.NOT_FOUND, 'Board not found');
  await assertWorkspaceMember(board.workspaceId, req.user._id);

  if (req.body.title !== undefined) board.title = req.body.title;
  if (req.body.background !== undefined) board.background = req.body.background;
  if (req.body.members !== undefined) {
    board.members = Array.from(new Set([req.user._id.toString(), ...req.body.members]));
  }

  await board.save();
  await pushBoardActivity(board._id, 'board.updated', req.user._id, req.body);
  emitBoardEvent(req, board._id.toString(), 'board:updated', { boardId: board._id, action: 'updated' });

  res.json({ success: true, board });
});

const deleteBoard = asyncHandler(async (req, res) => {
  const board = await Board.findById(req.params.id);
  if (!board) throw new ApiError(StatusCodes.NOT_FOUND, 'Board not found');

  const workspace = await Workspace.findById(board.workspaceId).select('members boards');
  const currentMember = workspace.members.find(
    (member) => member.userId.toString() === req.user._id.toString(),
  );

  if (!currentMember || currentMember.role !== 'admin') {
    throw new ApiError(StatusCodes.FORBIDDEN, 'Workspace admin permission required');
  }

  const lists = await List.find({ boardId: board._id }).select('_id');
  const listIds = lists.map((list) => list._id);
  const cards = await Card.find({ listId: { $in: listIds } }).select('_id');
  const cardIds = cards.map((card) => card._id);

  await Promise.all([
    Comment.deleteMany({ cardId: { $in: cardIds } }),
    Card.deleteMany({ _id: { $in: cardIds } }),
    List.deleteMany({ _id: { $in: listIds } }),
    Board.deleteOne({ _id: board._id }),
    Workspace.findByIdAndUpdate(board.workspaceId, { $pull: { boards: board._id } }),
  ]);

  emitBoardEvent(req, board._id.toString(), 'board:deleted', { boardId: board._id });

  res.json({ success: true, message: 'Board deleted successfully' });
});

export {
  createBoard,
  getBoards,
  getBoard,
  getBoardFull,
  updateBoard,
  deleteBoard,
};
