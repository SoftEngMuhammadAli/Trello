const Joi = require('joi');

const createListSchema = Joi.object({
  title: Joi.string().min(1).max(120).required(),
  boardId: Joi.string().hex().length(24).required(),
  position: Joi.number().integer().min(0).optional(),
});

const updateListSchema = Joi.object({
  title: Joi.string().min(1).max(120).required(),
});

const updateListPositionSchema = Joi.object({
  position: Joi.number().integer().min(0).required(),
});

module.exports = { createListSchema, updateListSchema, updateListPositionSchema };
