import test from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import app from '../src/app.js';
import User from '../src/models/User.js';

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