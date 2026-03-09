const { StatusCodes } = require('http-status-codes');
const ApiError = require('../utils/ApiError');

function validate(schema, target = 'body') {
  return (req, _res, next) => {
    const { error, value } = schema.validate(req[target], {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        'Validation failed',
        error.details.map((detail) => detail.message),
      );
    }

    req[target] = value;
    next();
  };
}

module.exports = validate;
