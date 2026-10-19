const Log = require('../models/Log');
const { normalizeLog: normalizeBase } = require('../utils/normalizeLog');
const LEVELS = ['debug', 'info', 'warn', 'error', 'fatal'];

function normalizeLog(input) {
  try { return normalizeBase(input); }
  catch (error) { error.status = 400; throw error; }
}

async function ingestLog(req, res, next) {
  try {
    const log = await Log.create(normalizeLog(req.body));
    res.status(201).json({ data: log });
  } catch (error) { next(error); }
}

async function ingestBulk(req, res, next) {
  try {
    if (!Array.isArray(req.body.logs) || req.body.logs.length === 0) {
      return res.status(400).json({ error: 'Body must contain a non-empty logs array' });
    }
    if (req.body.logs.length > 500) {
      return res.status(400).json({ error: 'A maximum of 500 logs is allowed per request' });
    }
    const docs = req.body.logs.map(normalizeLog);
    const inserted = await Log.insertMany(docs, { ordered: true });
    res.status(201).json({ inserted: inserted.length });
  } catch (error) { next(error); }
}

function parseDate(value, field) {
  if (!value) return undefined;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    const error = new Error(`${field} must be a valid date`);
    error.status = 400;
    throw error;
  }
  return date;
}

async function queryLogs(req, res, next) {
  try {
    const { level, service, environment, search, from, to } = req.query;
    const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, Number.parseInt(req.query.limit, 10) || 25));
    const filter = {};
    if (level) {
      if (!LEVELS.includes(String(level).toLowerCase())) {
        return res.status(400).json({ error: `level must be one of: ${LEVELS.join(', ')}` });
      }
      filter.level = String(level).toLowerCase();
    }
    if (service) filter.service = service;
    if (environment) filter.environment = environment;
    if (search) filter.message = { $regex: escapeRegex(String(search).slice(0, 200)), $options: 'i' };
    const start = parseDate(from, 'from');
    const end = parseDate(to, 'to');
    if (start || end) {
      filter.timestamp = {};
      if (start) filter.timestamp.$gte = start;
      if (end) filter.timestamp.$lte = end;
    }
    const [data, total] = await Promise.all([
      Log.find(filter).sort({ timestamp: -1 }).skip((page - 1) * limit).limit(limit).lean(),
      Log.countDocuments(filter)
    ]);
    res.json({ data, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
  } catch (error) { next(error); }
}

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

async function logStats(req, res, next) {
  try {
    const since = req.query.from ? parseDate(req.query.from, 'from') : new Date(Date.now() - 24 * 60 * 60 * 1000);
    const until = req.query.to ? parseDate(req.query.to, 'to') : new Date();
    const match = { timestamp: { $gte: since, $lte: until } };
    if (req.query.service) match.service = req.query.service;
    const [byLevel, total, recentErrors] = await Promise.all([
      Log.aggregate([{ $match: match }, { $group: { _id: '$level', count: { $sum: 1 } } }, { $sort: { count: -1 } }]),
      Log.countDocuments(match),
      Log.find({ ...match, level: { $in: ['error', 'fatal'] } }).sort({ timestamp: -1 }).limit(5).select('timestamp level service message').lean()
    ]);
    res.json({ window: { from: since, to: until }, total, byLevel: Object.fromEntries(byLevel.map(x => [x._id, x.count])), recentErrors });
  } catch (error) { next(error); }
}

module.exports = { ingestLog, ingestBulk, queryLogs, logStats };
