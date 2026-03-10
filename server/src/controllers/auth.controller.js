import { StatusCodes } from 'http-status-codes';
import env from '../config/env.js';
import User from '../models/User.js';
import { createDefaultProfile } from '../models/User.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';
import {
  issueAuthTokens,
  rotateRefreshToken,
  revokeRefreshToken,
  revokeAllUserRefreshTokens,
} from '../services/token.service.js';

function setRefreshCookie(res, refreshToken) {
  res.cookie(env.refreshCookieName, refreshToken, {
    httpOnly: true,
    secure: env.nodeEnv === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
}

const sanitizeUser = (user) => {
  const rawUser = typeof user.toObject === 'function' ? user.toObject() : user;
  const safeUser = { ...rawUser };
  delete safeUser.password;
  return {
    ...safeUser,
    profile: safeUser.profile || createDefaultProfile({ name: safeUser.name, email: safeUser.email }),
  };
};

const register = asyncHandler(async (req, res) => {
  const existingUser = await User.findOne({ email: req.body.email });
  if (existingUser) {
    throw new ApiError(StatusCodes.CONFLICT, 'Email already in use');
  }

  const user = await User.create(req.body);
  const { accessToken, refreshToken } = await issueAuthTokens(user);
  setRefreshCookie(res, refreshToken);

  res.status(StatusCodes.CREATED).json({
    success: true,
    accessToken,
    user: sanitizeUser(user),
  });
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (!user || !(await user.comparePassword(password))) {
    throw new ApiError(StatusCodes.UNAUTHORIZED, 'Invalid credentials');
  }

  const { accessToken, refreshToken } = await issueAuthTokens(user);
  setRefreshCookie(res, refreshToken);

  res.json({
    success: true,
    accessToken,
    user: sanitizeUser(user),
  });
});

const refresh = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies[env.refreshCookieName];
  if (!refreshToken) {
    throw new ApiError(StatusCodes.UNAUTHORIZED, 'Refresh token missing');
  }

  const rotated = await rotateRefreshToken(refreshToken);
  const user = await User.findById(rotated.userId).select('-password');
  if (!user) {
    throw new ApiError(StatusCodes.UNAUTHORIZED, 'User not found');
  }

  setRefreshCookie(res, rotated.refreshToken);

  res.json({
    success: true,
    accessToken: rotated.accessToken,
    user: sanitizeUser(user),
  });
});

const logout = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies[env.refreshCookieName];
  await revokeRefreshToken(refreshToken);
  res.clearCookie(env.refreshCookieName);
  res.json({ success: true, message: 'Logged out successfully' });
});

const logoutAll = asyncHandler(async (req, res) => {
  await revokeAllUserRefreshTokens(req.user._id);
  res.clearCookie(env.refreshCookieName);
  res.json({ success: true, message: 'Logged out from all devices' });
});

const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    return res.json({
      success: true,
      message: 'If the email exists, password reset instructions have been sent',
    });
  }

  res.json({
    success: true,
    message:
      'Forgot password endpoint is active. Integrate an email provider to deliver reset links.',
  });
});

export { register, login, refresh, logout, logoutAll, forgotPassword };
