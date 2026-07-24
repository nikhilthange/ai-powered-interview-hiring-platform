/**
 * Prometheus & Grafana Monitoring Validation Test Suite
 * Validates Prometheus metrics exposition, format compliance, scrape configuration,
 * and Grafana dashboard JSON schema integrity.
 */
const fs = require('fs');
const path = require('path');

process.env.JWT_ACCESS_SECRET = 'test_access_secret_key_123';
process.env.JWT_REFRESH_SECRET = 'test_refresh_secret_key_456';

const app = require('../backend/app');

async function runMonitoringTests() {
  console.log('====================================================');
  console.log('📊 Prometheus & Grafana Monitoring Audit Suite');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  function assertTest(name, fn) {
    try {
      fn();
      console.log(`✅ [PASS] ${name}`);
      passed++;
    } catch (err) {
      console.error(`❌ [FAIL] ${name}: ${err.message}`);
      failed++;
    }
  }

  // 1. Validate prometheus.yml scrape config file
  assertTest('Prometheus Scrape Configuration (prometheus.yml)', () => {
    const promPath = path.join(__dirname, 'prometheus.yml');
    if (!fs.existsSync(promPath)) throw new Error('prometheus.yml file does not exist');
    const content = fs.readFileSync(promPath, 'utf8');
    if (!content.includes('scrape_configs:') || !content.includes('/api/v1/metrics')) {
      throw new Error('prometheus.yml missing mandatory scrape_configs or metrics_path /api/v1/metrics');
    }
  });

  // 2. Validate grafana-dashboard.json schema integrity
  assertTest('Grafana Dashboard JSON Schema & Panel Configuration', () => {
    const dashPath = path.join(__dirname, 'grafana-dashboard.json');
    if (!fs.existsSync(dashPath)) throw new Error('grafana-dashboard.json file does not exist');
    const json = JSON.parse(fs.readFileSync(dashPath, 'utf8'));
    if (!json.panels || !Array.isArray(json.panels) || json.panels.length === 0) {
      throw new Error('Grafana dashboard JSON missing valid panels array');
    }
    const hasRPS = json.panels.some(p => p.targets && p.targets.some(t => t.expr && t.expr.includes('http_requests_total')));
    const hasErrors = json.panels.some(p => p.targets && p.targets.some(t => t.expr && t.expr.includes('http_errors_total')));
    if (!hasRPS || !hasErrors) {
      throw new Error('Grafana dashboard missing RPS or Error rate Prometheus metrics expressions');
    }
  });

  // 3. Live Metrics Endpoint Scraping & Exposition Format Test
  const server = app.listen(5997);
  await new Promise(r => setTimeout(r, 300));

  try {
    const res = await fetch('http://localhost:5997/api/v1/metrics');
    const metricsText = await res.text();

    assertTest('Prometheus Metrics HTTP Endpoint Status & Content-Type', () => {
      if (res.status !== 200) throw new Error(`HTTP status returned ${res.status}`);
      const contentType = res.headers.get('content-type') || '';
      if (!contentType.includes('text/plain')) throw new Error(`Invalid Content-Type header: ${contentType}`);
    });

    assertTest('Prometheus Exposition Format & Metric Counters', () => {
      if (!metricsText.includes('# HELP http_requests_total')) throw new Error('Missing # HELP http_requests_total');
      if (!metricsText.includes('# TYPE http_requests_total counter')) throw new Error('Missing # TYPE http_requests_total counter');
      if (!metricsText.includes('http_requests_total')) throw new Error('Missing http_requests_total metric line');
      if (!metricsText.includes('http_errors_total')) throw new Error('Missing http_errors_total metric line');
    });

  } finally {
    server.close();
  }

  console.log('\n----------------------------------------------------');
  console.log(`Monitoring Audit Results: ${passed} Passed, ${failed} Failed`);
  console.log('----------------------------------------------------\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runMonitoringTests().catch(err => {
  console.error('❌ Monitoring test suite error:', err.message);
  process.exit(1);
});
