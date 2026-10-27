const mongoose = require('mongoose');
const { MONGO_URI } = require('./env');

let isConnected = false;

const connectDB = async () => {
  // Check if connection is already established (e.g. in serverless warm lambda)
  if (mongoose.connection.readyState >= 1) {
    return mongoose.connection;
  }

  try {
    const conn = await mongoose.connect(MONGO_URI, {
      autoIndex: true,
      serverSelectionTimeoutMS: 5000,
    });
    isConnected = true;
    console.log(`[MongoDB] Connected successfully: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.error(`[MongoDB] Connection error: ${error.message}`);
    // In serverless environments, do not process.exit(1) as it kills the lambda container
    if (process.env.NODE_ENV === 'production' || process.env.VERCEL) {
      throw error;
    }
    process.exit(1);
  }
};

module.exports = connectDB;
