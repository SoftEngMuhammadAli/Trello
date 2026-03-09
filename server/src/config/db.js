const mongoose = require('mongoose');
const env = require('./env');

async function connectDb() {
  await mongoose.connect(env.mongoUri);
  return mongoose.connection;
}

module.exports = connectDb;
