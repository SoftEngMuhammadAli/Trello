const Joi = require('joi');

const updateUserSchema = Joi.object({
  name: Joi.string().min(2).max(100),
  avatar: Joi.string().uri().allow('', null),
}).min(1);

module.exports = { updateUserSchema };
