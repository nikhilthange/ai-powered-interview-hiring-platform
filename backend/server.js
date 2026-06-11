/**
 * Uncaught Exception handler.
 * Must be declared at the absolute beginning of the process execution.
 */
process.on('uncaughtException', (err) => {
  console.error('========================================');
  console.error('UNCAUGHT EXCEPTION! 💥 Server will shut down.');
  console.error('Name:', err.name);
  console.error('Message:', err.message);
  console.error('Stack:', err.stack);
  console.error('========================================');
  if (err.cause) console.error('Cause:', err.cause);
  process.exit(1);
});

// Load dotenv environment variables
require('dotenv').config();

const requiredEnvVars = [
  'MONGO_URI',
  'JWT_ACCESS_SECRET',
  'JWT_REFRESH_SECRET',
  'JWT_ACCESS_EXPIRES_IN',
  'JWT_REFRESH_EXPIRES_IN',
];
const missing = requiredEnvVars.filter(v => !process.env[v]);
if (missing.length > 0) {
  console.error(`Missing required environment variables: ${missing.join(', ')}`);
  process.exit(1);
}

const app = require('./app');
const connectDB = require('./config/db');
const { initSocket } = require('./sockets/socketManager');
const { startSubscriptionJobs } = require('./jobs/subscriptionJobs');

connectDB();

const port = process.env.PORT || 5000;
const server = app.listen(port, () => {
  console.log(`Application running in ${process.env.NODE_ENV} mode on port ${port}...`);
});

try {
  initSocket(server);
} catch (err) {
  console.error('Failed to initialize Socket.io:', err.message);
}

// Start scheduled background jobs (subscription expiry, cleanup, etc.)
try {
  startSubscriptionJobs();
} catch (err) {
  console.error('Failed to start background jobs:', err.message);
}

/**
 * Unhandled Promise Rejections handler.
 * Logs the rejection details but does NOT shut down the server.
 * This prevents crashes from unhandled async errors while they are still logged.
 */
process.on('unhandledRejection', (reason) => {
  console.error('========================================');
  console.error('UNHANDLED REJECTION!', reason?.name || 'N/A');
  console.error('Message:', reason?.message || reason || 'N/A');
  console.error('Stack:', reason?.stack || 'N/A');
  console.error('========================================');
});

/**
 * Graceful Shutdown handler.
 * Closes HTTP server + Socket.io, then disconnects MongoDB.
 * Gives in-flight requests up to 10s to finish before force exit.
 */
const gracefulShutdown = async (signal) => {
  console.log(`\n${signal} received. Shutting down gracefully...`);
  server.close(async () => {
    console.log('HTTP server closed.');
    try {
      await require('mongoose').disconnect();
      console.log('MongoDB disconnected.');
    } catch (err) {
      console.error('MongoDB disconnect error:', err.message);
    }
    process.exit(0);
  });

  setTimeout(() => {
    console.error('Forced shutdown after timeout.');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
