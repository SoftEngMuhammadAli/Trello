import { StatusCodes } from 'http-status-codes';
import Workspace from '../models/Workspace.js';
import User from '../models/User.js';
import Board from '../models/Board.js';
import List from '../models/List.js';
import Card from '../models/Card.js';
import Comment from '../models/Comment.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';
import { getPagination } from '../utils/pagination.js';

const createWorkspace = asyncHandler(async (req, res) => {
  const workspace = await Workspace.create({
    name: req.body.name,
    description: req.body.description || '',
    createdBy: req.user._id,
    members: [{ userId: req.user._id, role: 'admin' }],
  });

  await User.findByIdAndUpdate(req.user._id, { $addToSet: { workspaces: workspace._id } });

  res.status(StatusCodes.CREATED).json({ success: true, workspace });
});

const getWorkspaces = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);

  const [workspaces, total] = await Promise.all([
    Workspace.find({ 'members.userId': req.user._id })
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('createdBy', 'name email avatar'),
    Workspace.countDocuments({ 'members.userId': req.user._id }),
  ]);

  res.json({
    success: true,
    data: workspaces,
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
});

const getWorkspaceById = asyncHandler(async (req, res) => {
  const workspace = await Workspace.findById(req.params.id)
    .populate('members.userId', 'name email avatar')
    .populate('boards', 'title background updatedAt');

  if (!workspace) throw new ApiError(StatusCodes.NOT_FOUND, 'Workspace not found');

  const isMember = workspace.members.some(
    (member) => member.userId && member.userId._id.toString() === req.user._id.toString(),
  );

  if (!isMember) throw new ApiError(StatusCodes.FORBIDDEN, 'Workspace access denied');

  res.json({ success: true, workspace });
});

const updateWorkspace = asyncHandler(async (req, res) => {
  const workspace = await Workspace.findById(req.params.id);
  if (!workspace) throw new ApiError(StatusCodes.NOT_FOUND, 'Workspace not found');

  const currentMember = workspace.members.find(
    (member) => member.userId.toString() === req.user._id.toString(),
  );
  if (!currentMember || currentMember.role !== 'admin') {
    throw new ApiError(StatusCodes.FORBIDDEN, 'Admin permission required');
  }

  if (req.body.name !== undefined) workspace.name = req.body.name;
  if (req.body.description !== undefined) workspace.description = req.body.description;

  if (req.body.members) {
    workspace.members = req.body.members;
    const memberIds = req.body.members.map((member) => member.userId);
    memberIds.push(req.user._id.toString());

    await User.updateMany({ _id: { $in: memberIds } }, { $addToSet: { workspaces: workspace._id } });
    await User.updateMany({ _id: { $nin: memberIds } }, { $pull: { workspaces: workspace._id } });
  }

  await workspace.save();
  const hydrated = await Workspace.findById(workspace._id).populate('members.userId', 'name email avatar');

  res.json({ success: true, workspace: hydrated });
});

const deleteWorkspace = asyncHandler(async (req, res) => {
  const workspace = await Workspace.findById(req.params.id).select('members boards');
  if (!workspace) throw new ApiError(StatusCodes.NOT_FOUND, 'Workspace not found');

  const currentMember = workspace.members.find(
    (member) => member.userId.toString() === req.user._id.toString(),
  );

  if (!currentMember || currentMember.role !== 'admin') {
    throw new ApiError(StatusCodes.FORBIDDEN, 'Admin permission required');
  }

  const boardIds = workspace.boards;
  const lists = await List.find({ boardId: { $in: boardIds } }).select('_id');
  const listIds = lists.map((list) => list._id);
  const cards = await Card.find({ listId: { $in: listIds } }).select('_id');
  const cardIds = cards.map((card) => card._id);

  await Promise.all([
    Comment.deleteMany({ cardId: { $in: cardIds } }),
    Card.deleteMany({ _id: { $in: cardIds } }),
    List.deleteMany({ _id: { $in: listIds } }),
    Board.deleteMany({ _id: { $in: boardIds } }),
    Workspace.deleteOne({ _id: workspace._id }),
    User.updateMany({}, { $pull: { workspaces: workspace._id } }),
  ]);

  res.json({ success: true, message: 'Workspace deleted successfully' });
});

export {
  createWorkspace,
  getWorkspaces,
  getWorkspaceById,
  updateWorkspace,
  deleteWorkspace,
};