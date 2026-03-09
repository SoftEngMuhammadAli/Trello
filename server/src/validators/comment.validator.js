const Joi = require('joi');

const createCommentSchema = Joi.object({
  text: Joi.string().min(1).max(2000).required(),
  cardId: Joi.string().hex().length(24).required(),
});

const updateCommentSchema = Joi.object({
  text: Joi.string().min(1).max(2000).required(),
});

module.exports = { createCommentSchema, updateCommentSchema };
