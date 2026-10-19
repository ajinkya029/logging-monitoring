const os = require('os');
const mongoose = require('mongoose');

function health(req, res) {
  const dbReady = mongoose.connection.readyState === 1;
  const payload = {
    status: dbReady ? 'ok' : 'degraded',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    checks: { database: dbReady ? 'connected' : 'disconnected' }
  };
  res.status(dbReady ? 200 : 503).json(payload);
}

function metrics(_req, res) {
  const memory = process.memoryUsage();
  res.json({
    timestamp: new Date().toISOString(),
    process: {
      pid: process.pid,
      uptimeSeconds: Math.floor(process.uptime()),
      memoryBytes: { rss: memory.rss, heapTotal: memory.heapTotal, heapUsed: memory.heapUsed, external: memory.external }
    },
    host: { platform: process.platform, arch: process.arch, cpus: os.cpus().length, loadAverage: os.loadavg(), totalMemoryBytes: os.totalmem(), freeMemoryBytes: os.freemem() }
  });
}

module.exports = { health, metrics };
