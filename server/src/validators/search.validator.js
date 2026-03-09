import Joi from 'joi';

const searchQuerySchema = Joi.object({
  q: Joi.string().trim().min(1).required(),
  boardId: Joi.string().hex().length(24).required(),
});

export { searchQuerySchema };