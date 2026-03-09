import { StatusCodes } from 'http-status-codes';
import Workspace from '../models/Workspace.js';
import Board from '../models/Board.js';
import ApiError from '../utils/ApiError.js';

async function getWorkspaceRole(workspaceId, userId) {
  const workspace = await Workspace.findById(workspaceId).select('members');
  if (!workspace) throw new ApiError(StatusCodes.NOT_FOUND, 'Workspace not found');
  const member = workspace.members.find((entry) => entry.userId.toString() === userId.toString());
  if (!member) return null;
  return member.role;
}

function workspaceMember(workspaceIdResolver) {
  return async (req, _res, next) => {
    const workspaceId = workspaceIdResolver(req);
    const role = await getWorkspaceRole(workspaceId, req.user._id);
    if (!role) throw new ApiError(StatusCodes.FORBIDDEN, 'Workspace access denied');
    req.workspaceRole = role;
    next();
  };
}

function workspaceAdmin(workspaceIdResolver) {
  return async (req, _res, next) => {
    const workspaceId = workspaceIdResolver(req);
    const role = await getWorkspaceRole(workspaceId, req.user._id);
    if (role !== 'admin') throw new ApiError(StatusCodes.FORBIDDEN, 'Admin permission required');
    req.workspaceRole = role;
    next();
  };
}

function boardMember(boardIdResolver) {
  return async (req, _res, next) => {
    const boardId = boardIdResolver(req);
    const board = await Board.findById(boardId).select('members workspaceId');
    if (!board) throw new ApiError(StatusCodes.NOT_FOUND, 'Board not found');

    const isBoardMember = board.members.some((memberId) => memberId.toString() === req.user._id.toString());
    if (isBoardMember) {
      req.board = board;
      return next();
    }

    const role = await getWorkspaceRole(board.workspaceId, req.user._id);
    if (!role) throw new ApiError(StatusCodes.FORBIDDEN, 'Board access denied');

    req.board = board;
    req.workspaceRole = role;
    next();
  };
}

export { workspaceMember, workspaceAdmin, boardMember };