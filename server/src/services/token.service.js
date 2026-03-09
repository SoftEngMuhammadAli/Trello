import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import env from '../config/env.js';
import RefreshToken from '../models/RefreshToken.js';

function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

function signAccessToken(user) {
  return jwt.sign({ sub: user._id.toString(), email: user.email }, env.jwtAccessSecret, {
    expiresIn: env.accessTokenExpires,
  });
}

function signRefreshToken(user) {
  return jwt.sign({ sub: user._id.toString() }, env.jwtRefreshSecret, {
    expiresIn: env.refreshTokenExpires,
  });
}

async function persistRefreshToken(userId, refreshToken) {
  const decoded = jwt.decode(refreshToken);
  const expiresAt = new Date(decoded.exp * 1000);
  await RefreshToken.create({
    userId,
    tokenHash: hashToken(refreshToken),
    expiresAt,
  });
}

/**
 * Create and persist token pair for a user session.
 * @param {{_id: string, email: string}} user
 * @returns {Promise<{accessToken: string, refreshToken: string}>}
 */
async function issueAuthTokens(user) {
  const accessToken = signAccessToken(user);
  const refreshToken = signRefreshToken(user);
  await persistRefreshToken(user._id, refreshToken);
  return { accessToken, refreshToken };
}

function verifyAccessToken(token) {
  return jwt.verify(token, env.jwtAccessSecret);
}

function verifyRefreshToken(token) {
  return jwt.verify(token, env.jwtRefreshSecret);
}

/**
 * Validates and rotates refresh tokens to reduce replay risk.
 * @param {string} oldRefreshToken
 */
async function rotateRefreshToken(oldRefreshToken) {
  const payload = verifyRefreshToken(oldRefreshToken);
  const tokenHash = hashToken(oldRefreshToken);

  const storedToken = await RefreshToken.findOne({ tokenHash, userId: payload.sub });
  if (!storedToken) {
    throw new Error('Refresh token not recognized');
  }

  await RefreshToken.deleteOne({ _id: storedToken._id });

  const user = { _id: payload.sub, email: payload.email || '' };
  const accessToken = signAccessToken(user);
  const refreshToken = signRefreshToken(user);
  await persistRefreshToken(payload.sub, refreshToken);
  return { accessToken, refreshToken, userId: payload.sub };
}

async function revokeRefreshToken(refreshToken) {
  if (!refreshToken) return;
  await RefreshToken.deleteOne({ tokenHash: hashToken(refreshToken) });
}

async function revokeAllUserRefreshTokens(userId) {
  await RefreshToken.deleteMany({ userId });
}

export {
  issueAuthTokens,
  verifyAccessToken,
  verifyRefreshToken,
  rotateRefreshToken,
  revokeRefreshToken,
  revokeAllUserRefreshTokens,
};