/**
 * Request Tracing Middleware (Correlation & Request IDs)
 */
const crypto = require('crypto');

module.exports = function requestTracing(req, res, next) {
  const correlationId = req.headers['x-correlation-id'] || req.headers['x-request-id'] || crypto.randomUUID();
  req.correlationId = correlationId;
  res.setHeader('X-Correlation-ID', correlationId);
  req.startTime = Date.now();
  next();
};
