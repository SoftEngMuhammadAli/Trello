const { StatusCodes } = require('http-status-codes');
const env = require('../config/env');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const {
  issueAuthTokens,
  rotateRefreshToken,
  revokeRefreshToken,
  revokeAllUserRefreshTokens,
} = require('../services/token.service');

function setRefreshCookie(res, refreshToken) {
  res.cookie(env.refreshCookieName, refreshToken, {
    httpOnly: true,
    secure: env.nodeEnv === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
}

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
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      createdAt: user.createdAt,
    },
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
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      createdAt: user.createdAt,
    },
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
    user,
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

module.exports = {
  register,
  login,
  refresh,
  logout,
  logoutAll,
  forgotPassword,
};
