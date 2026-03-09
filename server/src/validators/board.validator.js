import Joi from 'joi';

const backgroundSchema = Joi.object({
  type: Joi.string().valid('color', 'image').required(),
  value: Joi.string().required(),
});

const createBoardSchema = Joi.object({
  title: Joi.string().min(1).max(120).required(),
  workspaceId: Joi.string().hex().length(24).required(),
  background: backgroundSchema.optional(),
  members: Joi.array().items(Joi.string().hex().length(24)).optional(),
});

const updateBoardSchema = Joi.object({
  title: Joi.string().min(1).max(120),
  background: backgroundSchema,
  members: Joi.array().items(Joi.string().hex().length(24)),
}).min(1);

export { createBoardSchema, updateBoardSchema };
