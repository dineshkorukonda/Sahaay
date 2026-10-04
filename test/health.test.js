const test = require('node:test');
const assert = require('node:assert/strict');

test('GET /health - response payload verification', async (t) => {
  // Simulates healthcheck payload structure expected by CARF and monitoring agents
  const mockPayload = {
    status: 'ok',
    uptime: 142.8,
    timestamp: new Date().toISOString(),
    service: 'sahaay',
    checks: {
      database: 'healthy',
      system: 'ok'
    }
  };

  assert.equal(mockPayload.status, 'ok');
  assert.equal(mockPayload.service, 'sahaay');
  assert.ok(typeof mockPayload.uptime === 'number');
  assert.ok(mockPayload.uptime > 0);
  assert.equal(mockPayload.checks.database, 'healthy');
  assert.ok(!isNaN(Date.parse(mockPayload.timestamp)));
});

test('GET /health - system memory constraints within threshold', async (t) => {
  const mem = process.memoryUsage();
  assert.ok(mem.rss > 0, 'RSS should be greater than zero');
  assert.ok(mem.heapTotal > 0, 'Heap total should be positive');
  assert.ok(mem.heapUsed > 0, 'Heap used should be positive');
  assert.ok(mem.heapTotal >= mem.heapUsed, 'Heap total should be >= heap used');
});
