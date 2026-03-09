import mongoose from 'mongoose';
import env from './env.js';

async function connectDb() {
  await mongoose.connect(env.mongoUri);
  return mongoose.connection;
}

export default connectDb;