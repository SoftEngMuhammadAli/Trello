import mongoose from 'mongoose';
import { StatusCodes, getReasonPhrase } from 'http-status-codes';
import ApiError from '../utils/ApiError.js';

function notFound(_req, _res, next) {
  next(new ApiError(StatusCodes.NOT_FOUND, 'Route not found'));
}

// eslint-disable-next-line no-unused-vars
function errorHandler(err, _req, res, _next) {
  let status = err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR;
  let message = err.message || getReasonPhrase(status);
  let details = err.details || null;

  if (err instanceof mongoose.Error.ValidationError) {
    status = StatusCodes.BAD_REQUEST;
    message = 'Validation error';
    details = Object.values(err.errors).map((e) => e.message);
  }

  if (err.code === 11000) {
    status = StatusCodes.CONFLICT;
    message = 'Duplicate record';
    details = err.keyValue;
  }

  res.status(status).json({
    success: false,
    message,
    details,
  });
}

export { notFound, errorHandler };