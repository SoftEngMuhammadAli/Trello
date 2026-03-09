const test = require('node:test');
const assert = require('node:assert/strict');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const {
  issueAuthTokens,
  verifyAccessToken,
  verifyRefreshToken,
} = require('../src/services/token.service');

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