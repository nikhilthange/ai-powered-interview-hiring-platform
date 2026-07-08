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

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

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
const { startEmailJobs } = require('./jobs/emailJobs');

connectDB();

const configuredPort = parseInt(process.env.PORT, 10) || 5000;

/**
 * Kill any existing process holding the given TCP port (Windows).
 * Uses netstat + taskkill to free the port before binding.
 */
function freePort(p) {
  try {
    const stdout = execSync(`netstat -ano | findstr ":${p} "`, { encoding: 'utf8', timeout: 5000 });
    const listening = stdout.split(/\r?\n/).filter(l => l.includes('LISTENING'));
    for (const line of listening) {
      const parts = line.trim().split(/\s+/);
      const pid = parts[parts.length - 1];
      if (pid && pid !== '0') {
        execSync(`taskkill /PID ${pid} /F`, { stdio: 'ignore', timeout: 5000 });
        console.log(`Freed port ${p} — killed stale process ${pid}.`);
      }
    }
  } catch {
    // no process found or command failed; port is free
  }
}

/**
 * Update the frontend .env file when the effective port differs from configured.
 * Ensures VITE_API_URL and VITE_SOCKET_URL stay in sync.
 */
function syncFrontendEnv(actualPort) {
  const frontendEnvPath = path.join(__dirname, '..', 'frontend', '.env');
  try {
    let content = fs.readFileSync(frontendEnvPath, 'utf8');
    const apiLine = `VITE_API_URL=http://localhost:${actualPort}/api/v1`;
    const socketLine = `VITE_SOCKET_URL=http://localhost:${actualPort}`;
    content = content.replace(/^VITE_API_URL=.*/m, apiLine);
    content = content.replace(/^VITE_SOCKET_URL=.*/m, socketLine);
    fs.writeFileSync(frontendEnvPath, content, 'utf8');
    console.log(`Synced frontend .env → port ${actualPort}`);
  } catch {
    console.warn('Could not update frontend/.env — skipping.');
  }
}

// ── Free the configured port before attempting to listen ──
freePort(configuredPort);

let activePort = configuredPort;

function startServer(attemptPort, retries = 0) {
  const server = app.listen(attemptPort)
    .on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        if (retries < 3) {
          console.warn(`Port ${attemptPort} is in use. Retrying in 2s... (attempt ${retries + 1}/3)`);
          setTimeout(() => {
            server.close();
            startServer(attemptPort, retries + 1);
          }, 2000);
        } else {
          const nextPort = attemptPort + 1;
          console.warn(`Port ${attemptPort} still busy after 3 retries. Trying port ${nextPort}...`);
          activePort = nextPort;
          freePort(nextPort);
          server.close();
          startServer(nextPort, 0);
        }
      } else {
        console.error('Server error:', err.message);
        process.exit(1);
      }
    })
    .on('listening', () => {
      if (activePort !== configuredPort) {
        console.log(`NOTE: Using port ${activePort} instead of configured port ${configuredPort}.`);
        syncFrontendEnv(activePort);
      }
      console.log(`Application running in ${process.env.NODE_ENV} mode on port ${activePort}...`);
    });
  return server;
}

const server = startServer(configuredPort);

try {
  initSocket(server);
} catch (err) {
  console.error('Failed to initialize Socket.io:', err.message);
}

// Start scheduled background jobs (subscription expiry, cleanup, etc.)
try {
  startSubscriptionJobs();
  startEmailJobs();
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
