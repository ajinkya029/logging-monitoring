function requireApiKey(req, res, next) {
  const expected = process.env.INGEST_API_KEY;
  if (!expected) {
    return res.status(503).json({ error: 'Ingestion is not configured: INGEST_API_KEY is missing' });
  }
  const supplied = req.get('x-api-key');
  if (!supplied || supplied.length !== expected.length ||
      !require('crypto').timingSafeEqual(Buffer.from(supplied), Buffer.from(expected))) {
    return res.status(401).json({ error: 'Invalid or missing API key' });
  }
  next();
}

module.exports = { requireApiKey };
