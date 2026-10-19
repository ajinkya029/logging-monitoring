function notFound(req, res) {
  res.status(404).json({ error: 'Route not found', path: req.originalUrl });
}

function errorHandler(err, _req, res, _next) {
  console.error(err);
  if (err.name === 'ValidationError' || err.name === 'CastError') {
    return res.status(400).json({ error: 'Invalid request data', details: err.message });
  }
  if (err.type === 'entity.too.large') {
    return res.status(413).json({ error: 'Request body is too large' });
  }
  res.status(err.status || 500).json({
    error: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message
  });
}

module.exports = { notFound, errorHandler };
