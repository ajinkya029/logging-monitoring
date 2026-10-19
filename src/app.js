const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const logRoutes = require('./routes/logRoutes');
const monitoringRoutes = require('./routes/monitoringRoutes');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

const app = express();
app.disable('x-powered-by');
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',').map(x => x.trim()) : false
}));
app.use(express.json({ limit: '256kb' }));
app.use(express.urlencoded({ extended: false, limit: '64kb' }));
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(rateLimit({ windowMs: 60 * 1000, limit: 300, standardHeaders: 'draft-7', legacyHeaders: false }));

app.get('/', (_req, res) => res.json({
  name: 'Logging & Monitoring Service',
  version: '1.0.0',
  docs: '/api/docs',
  health: '/api/health'
}));
app.get('/api/docs', (_req, res) => res.json({
  service: 'Logging & Monitoring Service API',
  endpoints: {
    'GET /api/health': 'Service and database health',
    'POST /api/logs': 'Ingest one log event; requires x-api-key',
    'POST /api/logs/bulk': 'Ingest up to 500 events; requires x-api-key',
    'GET /api/logs': 'Query logs with filters and pagination',
    'GET /api/logs/stats': 'Log counts grouped by level',
    'GET /api/metrics': 'Basic process metrics'
  },
  queryParameters: {
    level: 'debug|info|warn|error|fatal',
    service: 'Exact service name',
    search: 'Text search over message',
    from: 'ISO date lower bound',
    to: 'ISO date upper bound',
    page: '1-based page number',
    limit: '1-100, default 25'
  }
}));
app.use('/api/logs', logRoutes);
app.use('/api', monitoringRoutes);
app.use(notFound);
app.use(errorHandler);

module.exports = app;
