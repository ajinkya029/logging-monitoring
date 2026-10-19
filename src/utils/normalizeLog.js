const LEVELS = ['debug', 'info', 'warn', 'error', 'fatal'];

function normalizeLog(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Each log must be an object');
  const level = String(input.level || 'info').toLowerCase();
  const message = typeof input.message === 'string' ? input.message.trim() : '';
  const service = typeof input.service === 'string' ? input.service.trim() : '';
  if (!LEVELS.includes(level)) throw new Error(`level must be one of: ${LEVELS.join(', ')}`);
  if (!message || !service) throw new Error('message and service are required');
  const timestamp = input.timestamp ? new Date(input.timestamp) : new Date();
  if (Number.isNaN(timestamp.getTime())) throw new Error('timestamp must be a valid date');
  const metadata = input.metadata === undefined ? {} : input.metadata;
  if (metadata === null || typeof metadata !== 'object') throw new Error('metadata must be an object or array');
  return {
    timestamp, level, message, service,
    environment: input.environment || 'development',
    requestId: input.requestId, traceId: input.traceId, host: input.host, metadata
  };
}

module.exports = { normalizeLog };
