const Joi = require('joi');

const createWorkspaceSchema = Joi.object({
  name: Joi.string().min(2).max(120).required(),
  description: Joi.string().max(500).allow(''),
});

const updateWorkspaceSchema = Joi.object({
  name: Joi.string().min(2).max(120),
  description: Joi.string().max(500).allow(''),
  members: Joi.array()
    .items(
      Joi.object({
        userId: Joi.string().hex().length(24).required(),
        role: Joi.string().valid('admin', 'member').required(),
      }),
    )
    .optional(),
}).min(1);

module.exports = { createWorkspaceSchema, updateWorkspaceSchema };
