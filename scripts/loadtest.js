/**
 * Autocannon & K6 Production Load Testing Script
 */
const http = require('http');

console.log('====================================================');
console.log('🚀 HireMate Production Load & Concurrency Benchmark');
console.log('====================================================');

const TARGET_URL = process.env.TARGET_URL || 'http://localhost:5000/api/v1/health';
const CONCURRENCY = 20;
const TOTAL_REQUESTS = 200;

let completed = 0;
let success = 0;
let failed = 0;
const startTime = Date.now();

function makeRequest() {
  http.get(TARGET_URL, (res) => {
    if (res.statusCode === 200) {
      success++;
    } else {
      failed++;
    }
    completed++;

    if (completed < TOTAL_REQUESTS) {
      makeRequest();
    } else if (completed === TOTAL_REQUESTS) {
      const duration = (Date.now() - startTime) / 1000;
      const rps = Math.round(TOTAL_REQUESTS / duration);
      console.log(`\nLoad Test Completed:`);
      console.log(`- Total Requests: ${TOTAL_REQUESTS}`);
      console.log(`- Success Rate:   ${success}/${TOTAL_REQUESTS} (HTTP 200)`);
      console.log(`- Duration:       ${duration.toFixed(2)}s`);
      console.log(`- Throughput:     ${rps} req/sec\n`);
    }
  }).on('error', (err) => {
    failed++;
    completed++;
  });
}

for (let i = 0; i < CONCURRENCY; i++) {
  makeRequest();
}
