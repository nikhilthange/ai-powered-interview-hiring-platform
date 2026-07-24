const express = require('express');
const mongoose = require('mongoose');
const http = require('http');

process.env.PORT = '5999';
process.env.MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/hiremate_test';
process.env.JWT_ACCESS_SECRET = 'test_access_secret_key_123456789';
process.env.JWT_REFRESH_SECRET = 'test_refresh_secret_key_987654321';
process.env.JWT_ACCESS_EXPIRES_IN = '15m';
process.env.JWT_REFRESH_EXPIRES_IN = '7d';

const app = require('../app');
const connectDB = require('../config/db');

async function runVerification() {
  console.log('====================================================');
  console.log('🚀 Running E2E Authentication & Load Test Verification');
  console.log('====================================================\n');

  await connectDB();

  const server = app.listen(5999);
  await new Promise(resolve => setTimeout(resolve, 500));

  try {
    const testUser = {
      name: 'Verification User',
      email: `verify_${Date.now()}@example.com`,
      password: 'Password123!',
      role: 'candidate'
    };

    console.log('--- 1. Testing Registration & Login Flow ---');
    // Register
    const regRes = await fetch('http://localhost:5999/api/v1/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testUser)
    });
    const regData = await regRes.json();
    console.log('Register HTTP status:', regRes.status, 'Status:', regData.status);

    // Login
    const loginRes = await fetch('http://localhost:5999/api/v1/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testUser.email, password: testUser.password })
    });
    const loginData = await loginRes.json();
    const setCookie = loginRes.headers.get('set-cookie');
    const accessToken = loginData.accessToken;
    console.log('Login HTTP status:', loginRes.status, 'AccessToken returned:', !!accessToken, 'Set-Cookie returned:', !!setCookie);

    console.log('\n--- 2. Testing Refresh Token Flow (Without localStorage token) ---');
    const refreshRes = await fetch('http://localhost:5999/api/v1/auth/refresh', {
      method: 'POST',
      headers: {
        'Cookie': setCookie || ''
      }
    });
    const refreshData = await refreshRes.json();
    const refreshedAccessToken = refreshData.accessToken || accessToken;
    const newSetCookie = refreshRes.headers.get('set-cookie') || setCookie;
    console.log('Refresh HTTP status:', refreshRes.status, 'New AccessToken returned:', !!refreshData.accessToken);

    console.log('\n--- 3. Testing Concurrent Requests Flow ---');
    const CONCURRENT_COUNT = 50;
    const concurrentPromises = Array.from({ length: CONCURRENT_COUNT }).map(() =>
      fetch('http://localhost:5999/api/v1/auth/me', {
        headers: {
          'Authorization': `Bearer ${refreshedAccessToken}`
        }
      })
    );
    const concurrentResults = await Promise.all(concurrentPromises);
    const successConcurrent = concurrentResults.filter(r => r.status === 200).length;
    console.log(`Concurrent requests (Count=${CONCURRENT_COUNT}): ${successConcurrent}/${CONCURRENT_COUNT} succeeded HTTP 200`);

    console.log('\n--- 4. Testing Logout Flow ---');
    const logoutRes = await fetch('http://localhost:5999/api/v1/auth/logout', {
      method: 'POST',
      headers: {
        'Cookie': newSetCookie || ''
      }
    });
    const logoutData = await logoutRes.json();
    console.log('Logout HTTP status:', logoutRes.status, 'Message:', logoutData.message);

    console.log('\n--- 5. Running Load Test & Calculating Latency / RPS / Error Rate ---');
    const LOAD_TOTAL = 500;
    const LOAD_CONCURRENCY = 25;
    const latencies = [];
    let loadSuccess = 0;
    let loadFailed = 0;

    const startTime = Date.now();

    async function worker(requestsToRun) {
      for (let i = 0; i < requestsToRun; i++) {
        const reqStart = Date.now();
        try {
          const res = await fetch('http://localhost:5999/api/v1/health');
          const elapsed = Date.now() - reqStart;
          latencies.push(elapsed);
          if (res.status === 200) {
            loadSuccess++;
          } else {
            loadFailed++;
          }
        } catch (e) {
          loadFailed++;
        }
      }
    }

    const perWorker = Math.floor(LOAD_TOTAL / LOAD_CONCURRENCY);
    const workers = Array.from({ length: LOAD_CONCURRENCY }).map(() => worker(perWorker));
    await Promise.all(workers);

    const totalDurationSec = (Date.now() - startTime) / 1000;
    latencies.sort((a, b) => a - b);

    const rps = (loadSuccess + loadFailed) / totalDurationSec;
    const p95Index = Math.floor(latencies.length * 0.95);
    const p99Index = Math.floor(latencies.length * 0.99);
    const p95Latency = latencies[p95Index] || 0;
    const p99Latency = latencies[p99Index] || 0;
    const errorRate = (loadFailed / (loadSuccess + loadFailed)) * 100;

    console.log(`Load Test Execution Results:`);
    console.log(`- Requests/sec:  ${rps.toFixed(2)} req/sec`);
    console.log(`- P95 Latency:   ${p95Latency} ms`);
    console.log(`- P99 Latency:   ${p99Latency} ms`);
    console.log(`- Error Rate:    ${errorRate.toFixed(2)} %`);
    console.log(`- Total Requests:${latencies.length}`);

  } catch (err) {
    console.error('Verification error:', err);
  } finally {
    server.close();
    await mongoose.disconnect();
    console.log('\nVerification completed. Shutting down.');
    process.exit(0);
  }
}

runVerification();
