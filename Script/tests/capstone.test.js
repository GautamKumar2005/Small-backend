const http = require('http');
const assert = require('assert');
const { app } = require('../server');
const enrichmentService = require('../src/services/enrichment.service');
const webhookService = require('../src/services/webhook.service');
const { limiterInstance } = require('../src/middleware/rateLimit.middleware');
const widgetRepo = require('../src/repositories/widget.repository');
const submissionRepo = require('../src/repositories/submission.repository');

const TEST_PORT = 3333;
let server = null;

function request(options, body = null) {
  return new Promise((resolve, reject) => {
    const reqOptions = {
      hostname: 'localhost',
      port: TEST_PORT,
      path: options.path,
      method: options.method || 'GET',
      headers: options.headers || {}
    };

    const req = http.request(reqOptions, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        let parsed = null;
        try {
          if (data && res.headers['content-type'] && res.headers['content-type'].includes('application/json')) {
            parsed = JSON.parse(data);
          }
        } catch (e) {
          // keep string
        }
        resolve({
          status: res.statusCode,
          headers: res.headers,
          body: parsed || data
        });
      });
    });

    req.on('error', reject);

    if (body) {
      if (typeof body === 'object') {
        req.write(JSON.stringify(body));
      } else {
        req.write(body);
      }
    }
    req.end();
  });
}

async function runTests() {
  console.log('================================================================');
  console.log('  FlyRank AI — Week 9 Capstone Automated Test Suite');
  console.log('  Embeddable Widget & Lead-Capture Platform');
  console.log('================================================================\n');

  // Start test server
  server = app.listen(TEST_PORT);

  let passed = 0;
  let failed = 0;

  async function test(name, fn) {
    try {
      await fn();
      console.log(`  [PASS] ${name}`);
      passed++;
    } catch (err) {
      console.error(`  [FAIL] ${name}`);
      console.error(`         -> ${err.message}`);
      failed++;
    }
  }

  // Ensure fresh seed state
  widgetRepo.reset();
  submissionRepo.reset();
  limiterInstance.reset();

  try {
    console.log('--- Test Suite 1: CDN Config Delivery & Cache Headers ---');
    await test('GET /api/widgets/wdg-demo-123/config returns Cache-Control, ETag, and widget JSON', async () => {
      const res = await request({ path: '/api/widgets/wdg-demo-123/config' });
      assert.strictEqual(res.status, 200, 'Status should be 200');
      assert.ok(res.headers['cache-control'], 'Must have Cache-Control header');
      assert.ok(res.headers['etag'], 'Must have ETag header');
      assert.strictEqual(res.body.success, true);
      assert.strictEqual(res.body.config.id, 'wdg-demo-123');
    });

    await test('GET /api/widgets/wdg-demo-123/config with matching ETag returns 304 Not Modified', async () => {
      const first = await request({ path: '/api/widgets/wdg-demo-123/config' });
      const etag = first.headers['etag'];
      const res = await request({
        path: '/api/widgets/wdg-demo-123/config',
        headers: { 'If-None-Match': etag }
      });
      assert.strictEqual(res.status, 304, 'Must return 304 Not Modified when ETag matches');
    });

    console.log('\n--- Test Suite 2: CORS Preflight Handled ---');
    await test('OPTIONS /api/widgets/wdg-demo-123/submissions handles preflight with correct headers', async () => {
      const res = await request({
        method: 'OPTIONS',
        path: '/api/widgets/wdg-demo-123/submissions',
        headers: {
          'Origin': 'http://localhost:3001',
          'Access-Control-Request-Method': 'POST'
        }
      });
      assert.strictEqual(res.status, 204, 'Preflight should return 204');
      assert.strictEqual(res.headers['access-control-allow-origin'], 'http://localhost:3001');
      assert.ok(res.headers['access-control-allow-methods'].includes('POST'));
    });

    console.log('\n--- Test Suite 3: Input Validation (Honest Status Codes) ---');
    await test('POST malformed / empty payload returns 400 Bad Request', async () => {
      const res = await request({
        method: 'POST',
        path: '/api/widgets/wdg-demo-123/submissions',
        headers: { 'Content-Type': 'application/json' }
      }, {});
      assert.strictEqual(res.status, 400, 'Empty payload should return 400');
    });

    await test('POST oversized payload (>10 KB) returns 413 Payload Too Large', async () => {
      const hugeString = 'x'.repeat(12000);
      const res = await request({
        method: 'POST',
        path: '/api/widgets/wdg-demo-123/submissions',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': String(hugeString.length)
        }
      }, hugeString);
      assert.strictEqual(res.status, 413, 'Oversized payload must return 413');
    });

    console.log('\n--- Test Suite 4: Enrichment Fallback Chain ---');
    await test('Provider 1 active -> returns primary geoProvider (mock-geo-primary)', async () => {
      enrichmentService.setProviderStatus('mock-geo-primary', true);
      const res = await request({
        method: 'POST',
        path: '/api/widgets/wdg-demo-123/submissions',
        headers: { 'Content-Type': 'application/json' }
      }, { name: 'Alice Primary', email: 'alice@techcorp.io' });
      assert.strictEqual(res.status, 201, 'Valid submission returns 201');
      assert.strictEqual(res.body.geoProvider, 'mock-geo-primary');
    });

    await test('Provider 1 DOWN -> fails over to secondary geoProvider (mock-geo-secondary) without error', async () => {
      // Toggle Provider 1 DOWN
      enrichmentService.setProviderStatus('mock-geo-primary', false);
      const res = await request({
        method: 'POST',
        path: '/api/widgets/wdg-demo-123/submissions',
        headers: { 'Content-Type': 'application/json' }
      }, { name: 'Bob Fallback', email: 'bob@techcorp.io' });
      assert.strictEqual(res.status, 201, 'Failover submission MUST STILL succeed with 201');
      assert.strictEqual(res.body.geoProvider, 'mock-geo-secondary', 'Must use mock-geo-secondary fallback provider');
      // Re-enable Provider 1 for remaining tests
      enrichmentService.setProviderStatus('mock-geo-primary', true);
    });

    console.log('\n--- Test Suite 5: Safe Side Effects (Graceful Degradation) ---');
    await test('Email/webhook side-effect failure does not fail the submission', async () => {
      webhookService.setSimulateFailure(true);
      const res = await request({
        method: 'POST',
        path: '/api/widgets/wdg-demo-123/submissions',
        headers: { 'Content-Type': 'application/json' }
      }, { name: 'Carol Safe', email: 'carol@techcorp.io' });
      assert.strictEqual(res.status, 201, 'Must return 201 even when email/webhook fails');
      assert.strictEqual(res.body.success, true);
      webhookService.setSimulateFailure(false);
    });

    console.log('\n--- Test Suite 6: Abuse Resistance (Honeypot & Rate Limiter) ---');
    await test('Honeypot spam trap triggered returns 422 Unprocessable Entity', async () => {
      const res = await request({
        method: 'POST',
        path: '/api/widgets/wdg-demo-123/submissions',
        headers: { 'Content-Type': 'application/json' }
      }, { name: 'Spam Bot', email: 'bot@spam.com', _hp_trap: 'http://viagra.xyz' });
      assert.strictEqual(res.status, 422, 'Spam honeypot must be rejected with 422');
    });

    await test('Burst exceeding rate limit returns 429 Too Many Requests with Retry-After', async () => {
      limiterInstance.reset();
      let status429Observed = false;
      for (let i = 1; i <= 12; i++) {
        const res = await request({
          method: 'POST',
          path: '/api/widgets/wdg-demo-123/submissions',
          headers: { 'Content-Type': 'application/json' }
        }, { name: `Burst User ${i}`, email: `burst${i}@test.com` });
        if (res.status === 429) {
          status429Observed = true;
          assert.ok(res.headers['retry-after'], '429 must include Retry-After header');
          break;
        }
      }
      assert.strictEqual(status429Observed, true, 'Rate limiter MUST trigger 429 after limit exceeded');
    });

  } finally {
    if (server) {
      server.close();
    }
  }

  console.log('\n================================================================');
  console.log(`  Test Summary: ${passed} PASSED | ${failed} FAILED`);
  console.log('================================================================\n');

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

if (require.main === module) {
  runTests();
}

module.exports = {
  runTests
};
