/**
 * Prometheus Metrics Tracker
 */
class MetricsService {
  constructor() {
    this.requestCount = 0;
    this.errorCount = 0;
    this.startTime = Date.now();
  }

  incRequests() {
    this.requestCount++;
  }

  incErrors() {
    this.errorCount++;
  }

  getMetrics() {
    const uptimeSeconds = Math.floor((Date.now() - this.startTime) / 1000);
    const memUsage = process.memoryUsage();

    return [
      '# HELP http_requests_total Total HTTP requests processed',
      '# TYPE http_requests_total counter',
      `http_requests_total ${this.requestCount}`,
      '# HELP http_errors_total Total HTTP 5xx errors',
      '# TYPE http_errors_total counter',
      `http_errors_total ${this.errorCount}`,
      '# HELP process_uptime_seconds Process uptime in seconds',
      '# TYPE process_uptime_seconds gauge',
      `process_uptime_seconds ${uptimeSeconds}`,
      '# HELP process_heap_bytes Memory heap usage',
      '# TYPE process_heap_bytes gauge',
      `process_heap_bytes ${memUsage.heapUsed}`
    ].join('\n');
  }
}

module.exports = new MetricsService();
