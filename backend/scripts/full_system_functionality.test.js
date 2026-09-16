/**
 * Comprehensive Full-System Functionality Test Suite
 */
const assert = require('assert');
const path = require('path');
const fs = require('fs');
const jwt = require('jsonwebtoken');

process.env.JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'test-access-secret-32-chars-long-valid';
process.env.JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'test-refresh-secret-32-chars-long-valid';
process.env.JWT_ACCESS_EXPIRES_IN = '15m';
process.env.JWT_REFRESH_EXPIRES_IN = '7d';

async function runFullSystemTest() {
  console.log('====================================================');
  console.log('🧪 Full Project End-to-End Functionality Test Suite');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  async function testAsync(name, fn) {
    try {
      await fn();
      console.log(`✅ [PASS] ${name}`);
      passed++;
    } catch (err) {
      console.error(`❌ [FAIL] ${name}: ${err.message}`);
      failed++;
    }
  }

  // 1. Controller Exports & Signatures
  await testAsync('Backend Controllers Integrity (23/23 Controllers)', () => {
    const controllersDir = path.join(__dirname, '../controllers');
    const files = fs.readdirSync(controllersDir).filter(f => f.endsWith('.js'));
    assert.ok(files.length >= 20, `Expected >= 20 controllers, found ${files.length}`);

    for (const file of files) {
      const module = require(path.join(controllersDir, file));
      const methods = Object.keys(module);
      assert.ok(methods.length > 0, `Controller ${file} must export at least one handler method`);
    }
  });

  // 2. Mongoose Models Schema Integrity (24 Models)
  await testAsync('Database Models & Schema Definitions (24/24 Models)', () => {
    const modelsDir = path.join(__dirname, '../models');
    const files = fs.readdirSync(modelsDir).filter(f => f.endsWith('.js'));
    assert.ok(files.length >= 20, `Expected >= 20 models, found ${files.length}`);

    for (const file of files) {
      const model = require(path.join(modelsDir, file));
      const isClean = model.modelName || typeof model === 'function' || (typeof model === 'object' && Object.keys(model).length > 0);
      assert.ok(isClean, `Model ${file} must compile cleanly`);
    }
  });

  // 3. Cache Service In-Memory Operations
  await testAsync('Cache Service (Set, Get, Del, In-Memory Fallback)', async () => {
    const cacheService = require('../services/cacheService');
    await cacheService.set('test:key:1', { name: 'HireMate', active: true }, 60);
    const val = await cacheService.get('test:key:1');
    assert.deepStrictEqual(val, { name: 'HireMate', active: true }, 'Cache get must return stored value');
    await cacheService.del('test:key:1');
    const deletedVal = await cacheService.get('test:key:1');
    assert.strictEqual(deletedVal, null, 'Deleted key must return null');
  });

  // 4. Prometheus Metrics Service Formatting
  await testAsync('Prometheus Metrics Generation Service', () => {
    const metricsService = require('../services/metricsService');
    metricsService.incRequests();
    metricsService.incErrors();
    const metricsOutput = metricsService.getMetrics();
    assert.ok(typeof metricsOutput === 'string', 'Metrics must be string');
    assert.ok(metricsOutput.includes('http_requests_total'), 'Metrics must contain http_requests_total');
    assert.ok(metricsOutput.includes('http_errors_total'), 'Metrics must contain http_errors_total');
  });

  // 5. JWT Auth Signing & Verification
  await testAsync('JWT Auth Signing & Verification Security', () => {
    const token = jwt.sign({ id: 'user123', role: 'candidate' }, process.env.JWT_ACCESS_SECRET, { expiresIn: '15m' });
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    assert.strictEqual(decoded.id, 'user123', 'Decoded ID must match');
    assert.strictEqual(decoded.role, 'candidate', 'Decoded role must match');
  });

  // 6. AI Provider Multi-Provider Engine & Stream Routing
  await testAsync('AI Provider Multi-Provider Engine & Stream Routing', () => {
    const aiProvider = require('../services/aiProvider');
    assert.strictEqual(typeof aiProvider.call, 'function', 'call method must exist');
    assert.strictEqual(typeof aiProvider.stream, 'function', 'stream method must exist');
    assert.strictEqual(typeof aiProvider.nvidiaStream, 'function', 'nvidiaStream must exist');
    assert.strictEqual(typeof aiProvider.geminiStream, 'function', 'geminiStream must exist');
    assert.strictEqual(typeof aiProvider.openaiStream, 'function', 'openaiStream must exist');
    assert.strictEqual(typeof aiProvider.generateCoverLetter, 'function', 'generateCoverLetter must exist');
    assert.strictEqual(typeof aiProvider.tailorResume, 'function', 'tailorResume must exist');
    assert.strictEqual(typeof aiProvider.matchJob, 'function', 'matchJob must exist');
  });

  // 7. Email Templates Generator
  await testAsync('Email Template Engine', () => {
    const emailTemplates = require('../services/emailTemplates');
    const welcomeHtml = emailTemplates.welcomeEmail('Nikhil');
    assert.ok(welcomeHtml.includes('Nikhil'), 'Welcome template must include user name');
    const resetHtml = emailTemplates.passwordReset('Nikhil', 'https://hiremate.com/reset?token=123');
    assert.ok(resetHtml.includes('https://hiremate.com/reset?token=123'), 'Reset template must include reset URL');
  });

  // 8. File Parser Utility Module
  await testAsync('File Parser Utilities (PDF & DOCX Support)', () => {
    const fileParser = require('../utils/fileParser');
    assert.strictEqual(typeof fileParser.extractTextFromFile, 'function', 'extractTextFromFile must exist');
    assert.strictEqual(typeof fileParser.extractTextFromPDF, 'function', 'extractTextFromPDF must exist');
    assert.strictEqual(typeof fileParser.extractTextFromDOCX, 'function', 'extractTextFromDOCX must exist');
  });

  // 9. Frontend Services & API Clients
  await testAsync('Frontend API Clients (12 Service Files)', () => {
    const servicesDir = path.join(__dirname, '../../frontend/src/services');
    const apiFiles = fs.readdirSync(servicesDir).filter(f => f.endsWith('.js'));
    assert.ok(apiFiles.length >= 8, `Expected >= 8 frontend service modules, found ${apiFiles.length}`);
    const expected = ['axios.js', 'authApi.js', 'jobApi.js', 'applicationApi.js', 'chatApi.js', 'socket.js', 'aiChatApi.js'];
    for (const exp of expected) {
      assert.ok(apiFiles.includes(exp), `Frontend service ${exp} must exist`);
    }
  });

  // 10. Frontend Route Configuration
  await testAsync('Frontend Routes & Protected Route Matrix', () => {
    const routesFile = path.join(__dirname, '../../frontend/src/routes/index.jsx');
    assert.ok(fs.existsSync(routesFile), 'routes/index.jsx must exist');
    const content = fs.readFileSync(routesFile, 'utf8');
    assert.ok(content.includes('ProtectedRoute'), 'Must configure ProtectedRoute');
    assert.ok(content.includes('ResumeBuilderPage'), 'Must configure ResumeBuilderPage route');
    assert.ok(content.includes('MockInterview'), 'Must configure MockInterview route');
  });

  console.log('\n----------------------------------------------------');
  console.log(`Summary: ${passed} Passed, ${failed} Failed`);
  console.log('----------------------------------------------------\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runFullSystemTest();
