const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../../.env') });

module.exports = {
  PORT: process.env.PORT || 5000,
  MONGO_URI: process.env.MONGO_URI || 'mongodb://localhost:27017/imovies',
  JWT_SECRET: process.env.JWT_SECRET || 'imovies_super_secure_jwt_secret_key_2026!',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '1d',
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',
  SEAT_LOCK_MINUTES: parseInt(process.env.SEAT_LOCK_MINUTES, 10) || 5,
};
