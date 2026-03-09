import assert from 'node:assert/strict';
import mongoose from 'mongoose';
import request from 'supertest';
import app from '../src/app.js';
import User from '../src/models/User.js';
import RefreshToken from '../src/models/RefreshToken.js';
import {
  issueAuthTokens,
  verifyAccessToken,
  verifyRefreshToken,
} from '../src/services/token.service.js';

const usersByEmail = new Map();
const refreshTokens = new Map();

function patchModels() {
  User.findOne = async (query) => usersByEmail.get(query.email) || null;
  User.findById = async (id) => {
    const user = [...usersByEmail.values()].find((entry) => entry._id.toString() === id.toString());
    if (!user) return null;
    return { ...user, select: () => user };
  };
  User.create = async (payload) => {
    const user = {
      _id: new mongoose.Types.ObjectId(),
      name: payload.name,
      email: payload.email,
      password: payload.password,
      avatar: payload.avatar || '',
      createdAt: new Date(),
      comparePassword: async (rawPassword) => rawPassword === payload.password,
    };
    usersByEmail.set(user.email, user);
    return user;
  };

  RefreshToken.create = async (payload) => {
    refreshTokens.set(payload.tokenHash, payload);
    return payload;
  };
}

async function runTest(name, fn) {
  try {
    await fn();
    console.log(`PASS ${name}`);
  } catch (error) {
    console.error(`FAIL ${name}`);
    console.error(error);
    process.exitCode = 1;
  }
}

async function main() {
  patchModels();

  await runTest('token.service issues and verifies tokens', async () => {
    const user = { _id: new mongoose.Types.ObjectId(), email: 'unit@test.dev' };
    const tokens = await issueAuthTokens(user);
    assert.ok(tokens.accessToken);
    assert.ok(tokens.refreshToken);

    const accessPayload = verifyAccessToken(tokens.accessToken);
    const refreshPayload = verifyRefreshToken(tokens.refreshToken);

    assert.equal(accessPayload.sub, user._id.toString());
    assert.equal(refreshPayload.sub, user._id.toString());
  });

  await runTest('auth integration register + login', async () => {
    usersByEmail.clear();

    const registerResponse = await request(app).post('/api/auth/register').send({
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
    });

    assert.equal(registerResponse.status, 201);
    assert.ok(registerResponse.body.accessToken);

    const loginResponse = await request(app).post('/api/auth/login').send({
      email: 'test@example.com',
      password: 'password123',
    });

    assert.equal(loginResponse.status, 200);
    assert.equal(loginResponse.body.user.email, 'test@example.com');
  });

  if (process.exitCode) {
    process.exit(process.exitCode);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});