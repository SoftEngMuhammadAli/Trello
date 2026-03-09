import { StatusCodes } from 'http-status-codes';
import User from '../models/User.js';
import { verifyAccessToken } from '../services/token.service.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';

const auth = asyncHandler(async (req, _res, next) => {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    throw new ApiError(StatusCodes.UNAUTHORIZED, 'Authentication required');
  }

  try {
    const payload = verifyAccessToken(token);
    const user = await User.findById(payload.sub).select('-password');
    if (!user) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, 'User not found');
    }
    req.user = user;
    next();
  } catch (error) {
    throw new ApiError(StatusCodes.UNAUTHORIZED, 'Invalid or expired access token');
  }
});

export default auth;