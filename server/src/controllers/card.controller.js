const path = require('path');
const { StatusCodes } = require('http-status-codes');
const Board = require('../models/Board');
const List = require('../models/List');
const Card = require('../models/Card');
const Comment = require('../models/Comment');
const Workspace = require('../models/Workspace');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { pushBoardActivity } = require('../services/activity.service');
const { emitBoardEvent } = require('../services/socket.service');
const env = require('../config/env');

async function assertBoardAccess(boardId, userId) {
  const board = await Board.findById(boardId);
  if (!board) throw new ApiError(StatusCodes.NOT_FOUND, 'Board not found');
  const workspace = await Workspace.findById(board.workspaceId).select('members');

  const isBoardMember = board.members.some((memberId) => memberId.toString() === userId.toString());
  const isWorkspaceMember = workspace.members.some(
    (member) => member.userId.toString() === userId.toString(),
  );

  if (!isBoardMember && !isWorkspaceMember) {
    throw new ApiError(StatusCodes.FORBIDDEN, 'Board access denied');
  }

  return board;
}

async function getListWithBoardAccess(listId, userId) {
  const list = await List.findById(listId);
  if (!list) throw new ApiError(StatusCodes.NOT_FOUND, 'List not found');
  const board = await assertBoardAccess(list.boardId, userId);
  return { list, board };
}

const createCard = asyncHandler(async (req, res) => {
  const { listId, title, description, labels, dueDate, members, cover, position } = req.body;
  const { list, board } = await getListWithBoardAccess(listId, req.user._id);

  let targetPosition = position;
  if (targetPosition === undefined) {
    const lastCard = await Card.findOne({ listId }).sort({ position: -1 }).select('position');
    targetPosition = lastCard ? lastCard.position + 1 : 0;
  }

  const card = await Card.create({
    title,
    description: description || '',
    boardId: board._id,
    listId,
    position: targetPosition,
    labels: labels || [],
    dueDate: dueDate || null,
    members: members || [],
    cover: cover || '',
  });

  await List.findByIdAndUpdate(list._id, { $addToSet: { cards: card._id } });
  await pushBoardActivity(board._id, 'card.created', req.user._id, { cardId: card._id, listId: list._id });
  emitBoardEvent(req, board._id.toString(), 'card:created', { card });

  res.status(StatusCodes.CREATED).json({ success: true, card });
});

const getCard = asyncHandler(async (req, res) => {
  const card = await Card.findById(req.params.id)
    .populate('members', 'name email avatar')
    .populate({ path: 'comments', populate: { path: 'userId', select: 'name avatar' } });

  if (!card) throw new ApiError(StatusCodes.NOT_FOUND, 'Card not found');
  await assertBoardAccess(card.boardId, req.user._id);

  res.json({ success: true, card });
});

const updateCard = asyncHandler(async (req, res) => {
  const card = await Card.findById(req.params.id);
  if (!card) throw new ApiError(StatusCodes.NOT_FOUND, 'Card not found');
  await assertBoardAccess(card.boardId, req.user._id);

  const allowedFields = [
    'title',
    'description',
    'labels',
    'dueDate',
    'members',
    'cover',
    'archived',
  ];

  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) {
      card[field] = req.body[field];
    }
  });

  await card.save();
  await pushBoardActivity(card.boardId, 'card.updated', req.user._id, { cardId: card._id });
  emitBoardEvent(req, card.boardId.toString(), 'card:updated', { card });

  res.json({ success: true, card });
});

const moveCard = asyncHandler(async (req, res) => {
  const card = await Card.findById(req.params.id);
  if (!card) throw new ApiError(StatusCodes.NOT_FOUND, 'Card not found');
  const board = await assertBoardAccess(card.boardId, req.user._id);

  const sourceList = await List.findById(card.listId);
  const targetList = await List.findById(req.body.targetListId);

  if (!targetList) throw new ApiError(StatusCodes.NOT_FOUND, 'Target list not found');
  if (targetList.boardId.toString() !== sourceList.boardId.toString()) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Target list must belong to the same board');
  }

  const targetCards = await Card.find({ listId: targetList._id, _id: { $ne: card._id } }).sort({ position: 1 });
  const safePosition = Math.max(0, Math.min(req.body.targetPosition, targetCards.length));

  if (sourceList._id.toString() !== targetList._id.toString()) {
    await List.updateOne({ _id: sourceList._id }, { $pull: { cards: card._id } });
    await List.updateOne({ _id: targetList._id }, { $addToSet: { cards: card._id } });
  }

  targetCards.splice(safePosition, 0, card);

  await Promise.all(
    targetCards.map((item, index) =>
      Card.updateOne(
        { _id: item._id },
        {
          $set: {
            position: index,
            listId: targetList._id,
          },
        },
      ),
    ),
  );

  await pushBoardActivity(board._id, 'card.moved', req.user._id, {
    cardId: card._id,
    fromListId: sourceList._id,
    toListId: targetList._id,
    position: safePosition,
  });

  emitBoardEvent(req, board._id.toString(), 'card:moved', {
    cardId: card._id,
    fromListId: sourceList._id,
    toListId: targetList._id,
    position: safePosition,
  });

  res.json({ success: true, message: 'Card moved successfully' });
});

const uploadAttachment = asyncHandler(async (req, res) => {
  const card = await Card.findById(req.params.id);
  if (!card) throw new ApiError(StatusCodes.NOT_FOUND, 'Card not found');
  await assertBoardAccess(card.boardId, req.user._id);

  if (!req.file) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'File is required');
  }

  const attachment = {
    name: req.file.originalname,
    url: `/${env.uploadDir}/${path.basename(req.file.path)}`,
    mimeType: req.file.mimetype,
    size: req.file.size,
    uploadedBy: req.user._id,
  };

  card.attachments.push(attachment);
  await card.save();

  await pushBoardActivity(card.boardId, 'card.attachment_added', req.user._id, {
    cardId: card._id,
    name: attachment.name,
  });

  emitBoardEvent(req, card.boardId.toString(), 'card:attachment', { cardId: card._id, attachment });
  res.status(StatusCodes.CREATED).json({ success: true, attachment });
});

const deleteCard = asyncHandler(async (req, res) => {
  const card = await Card.findById(req.params.id);
  if (!card) throw new ApiError(StatusCodes.NOT_FOUND, 'Card not found');
  await assertBoardAccess(card.boardId, req.user._id);

  await Promise.all([
    Comment.deleteMany({ cardId: card._id }),
    List.findByIdAndUpdate(card.listId, { $pull: { cards: card._id } }),
    Card.deleteOne({ _id: card._id }),
  ]);

  await pushBoardActivity(card.boardId, 'card.deleted', req.user._id, { cardId: card._id });
  emitBoardEvent(req, card.boardId.toString(), 'card:deleted', { cardId: card._id });

  res.json({ success: true, message: 'Card deleted successfully' });
});

module.exports = {
  createCard,
  getCard,
  updateCard,
  moveCard,
  uploadAttachment,
  deleteCard,
};
