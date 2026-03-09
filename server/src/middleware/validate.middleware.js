import { StatusCodes } from 'http-status-codes';
import ApiError from '../utils/ApiError.js';

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

export default validate;