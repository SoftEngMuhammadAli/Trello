import Joi from 'joi';

const labelSchema = Joi.object({
  text: Joi.string().max(40).allow(''),
  color: Joi.string().required(),
});

const createCardSchema = Joi.object({
  title: Joi.string().min(1).max(300).required(),
  description: Joi.string().allow(''),
  listId: Joi.string().hex().length(24).required(),
  labels: Joi.array().items(labelSchema).optional(),
  dueDate: Joi.date().allow(null),
  members: Joi.array().items(Joi.string().hex().length(24)).optional(),
  cover: Joi.string().allow(''),
  position: Joi.number().integer().min(0).optional(),
});

const updateCardSchema = Joi.object({
  title: Joi.string().min(1).max(300),
  description: Joi.string().allow(''),
  labels: Joi.array().items(labelSchema),
  dueDate: Joi.date().allow(null),
  members: Joi.array().items(Joi.string().hex().length(24)),
  cover: Joi.string().allow(''),
  archived: Joi.boolean(),
}).min(1);

const moveCardSchema = Joi.object({
  targetListId: Joi.string().hex().length(24).required(),
  targetPosition: Joi.number().integer().min(0).required(),
});

export { createCardSchema, updateCardSchema, moveCardSchema };