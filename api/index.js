const app = require('../server/src/app');
const connectDB = require('../server/src/config/db');

module.exports = async (req, res) => {
  try {
    await connectDB();
  } catch (err) {
    console.error('[Vercel Serverless] Database connection failure:', err.message);
    return res.status(500).json({
      success: false,
      message: 'Database connection failed. Please ensure MONGO_URI is configured correctly in Vercel environment variables.',
    });
  }

  return app(req, res);
};
