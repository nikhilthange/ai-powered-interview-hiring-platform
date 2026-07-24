const mongoose = require('mongoose');
const metricsService = require('../services/metricsService');
const cacheService = require('../services/cacheService');

exports.getHealth = async (req, res) => {
  const dbState = mongoose.connection.readyState === 1 ? 'UP' : 'DOWN';
  const memoryUsage = process.memoryUsage();

  res.status(200).json({
    status: 'UP',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    database: dbState,
    memory: {
      heapUsedMB: Math.round(memoryUsage.heapUsed / 1024 / 1024),
      rssMB: Math.round(memoryUsage.rss / 1024 / 1024)
    }
  });
};

exports.getLive = (req, res) => {
  res.status(200).json({ status: 'ALIVE' });
};

exports.getReady = async (req, res) => {
  const isDbConnected = mongoose.connection.readyState === 1;
  if (!isDbConnected) {
    return res.status(503).json({ status: 'NOT_READY', reason: 'MongoDB disconnected' });
  }
  res.status(200).json({ status: 'READY' });
};

exports.getMetrics = (req, res) => {
  res.set('Content-Type', 'text/plain');
  res.send(metricsService.getMetrics());
};
