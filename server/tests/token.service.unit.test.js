import test from 'node:test';
import assert from 'node:assert/strict';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import {
  issueAuthTokens,
  verifyAccessToken,
  verifyRefreshToken,
} from '../src/services/token.service.js';

let mongoServer;

test.before(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
});

test.after(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  await mongoServer.stop();
});

test('issues and verifies access/refresh tokens', async () => {
  const user = { _id: new mongoose.Types.ObjectId(), email: 'unit@test.dev' };
  const tokens = await issueAuthTokens(user);

  assert.ok(tokens.accessToken);
  assert.ok(tokens.refreshToken);

  const accessPayload = verifyAccessToken(tokens.accessToken);
  const refreshPayload = verifyRefreshToken(tokens.refreshToken);

  assert.equal(accessPayload.sub, user._id.toString());
  assert.equal(refreshPayload.sub, user._id.toString());
});