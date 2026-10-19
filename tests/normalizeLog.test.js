const test = require('node:test');
const assert = require('node:assert/strict');
const { normalizeLog } = require('../src/utils/normalizeLog');

test('normalizes a minimal log with defaults', () => {
  const log = normalizeLog({ message: 'hello', service: 'api' });
  assert.equal(log.level, 'info');
  assert.equal(log.environment, 'development');
  assert.equal(log.message, 'hello');
  assert.ok(log.timestamp instanceof Date);
});

test('rejects missing required fields', () => {
  assert.throws(() => normalizeLog({ message: 'hello' }), /message and service are required/);
});

test('rejects unsupported levels', () => {
  assert.throws(() => normalizeLog({ level: 'verbose', message: 'hello', service: 'api' }), /level must be one of/);
});
