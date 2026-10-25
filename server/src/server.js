const app = require('./app');
const connectDB = require('./config/db');
const { PORT } = require('./config/env');
const startExpiredLocksJob = require('./jobs/releaseExpiredLocks');

// Connect to Database
connectDB();

// Start background job for seat lock cleanups
const stopExpiredLocksJob = startExpiredLocksJob(30000);

const server = app.listen(PORT, () => {
  console.log(`[IMovies Server] Running in http://localhost:${PORT}`);
  console.log(`[IMovies Server] Health check available at http://localhost:${PORT}/api/health`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error(`[Unhandled Rejection] ${err.message}`);
  // Keep server running or gracefully close if critical
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  stopExpiredLocksJob();
  server.close(() => {
    console.log('Process terminated.');
  });
});
