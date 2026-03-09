const test = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../src/app');
const User = require('../src/models/User');

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

test.beforeEach(async () => {
  await User.deleteMany({});
});

test('registers then logs in a user', async () => {
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