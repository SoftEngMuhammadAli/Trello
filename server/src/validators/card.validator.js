import Joi from 'joi';

const labelSchema = Joi.object({
  text: Joi.string().max(40).allow(''),
  color: Joi.string().required(),
});

const checklistItemSchema = Joi.object({
  id: Joi.string().required(),
  text: Joi.string().max(200).required(),
  done: Joi.boolean().required(),
});

const checklistSchema = Joi.object({
  id: Joi.string().required(),
  title: Joi.string().max(120).required(),
  items: Joi.array().items(checklistItemSchema).required(),
});

const cardStatus = Joi.string().valid('backlog', 'todo', 'in_progress', 'in_review', 'done', 'blocked');
const cardPriority = Joi.string().valid('low', 'medium', 'high', 'urgent');

const createCardSchema = Joi.object({
  title: Joi.string().min(1).max(300).required(),
  description: Joi.string().allow(''),
  listId: Joi.string().hex().length(24).required(),
  labels: Joi.array().items(labelSchema).optional(),
  status: cardStatus.optional(),
  priority: cardPriority.optional(),
  startDate: Joi.date().allow(null),
  dueDate: Joi.date().allow(null),
  members: Joi.array().items(Joi.string().hex().length(24)).optional(),
  cover: Joi.string().allow(''),
  checklists: Joi.array().items(checklistSchema).optional(),
  position: Joi.number().integer().min(0).optional(),
});

const updateCardSchema = Joi.object({
  title: Joi.string().min(1).max(300),
  description: Joi.string().allow(''),
  labels: Joi.array().items(labelSchema),
  status: cardStatus,
  priority: cardPriority,
  startDate: Joi.date().allow(null),
  dueDate: Joi.date().allow(null),
  members: Joi.array().items(Joi.string().hex().length(24)),
  cover: Joi.string().allow(''),
  checklists: Joi.array().items(checklistSchema),
  archived: Joi.boolean(),
}).min(1);

const moveCardSchema = Joi.object({
  targetListId: Joi.string().hex().length(24).required(),
  targetPosition: Joi.number().integer().min(0).required(),
});

export { createCardSchema, updateCardSchema, moveCardSchema };
