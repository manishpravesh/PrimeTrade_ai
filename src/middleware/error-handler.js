function notFoundHandler(req, res) {
  return res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
}

function errorHandler(err, req, res, next) {
  const status = err.status || 500;
  const message = status === 500 ? 'Internal server error' : err.message;
  if (status === 500) {
    // eslint-disable-next-line no-console
    console.error(err);
  }
  return res.status(status).json({ message });
}

module.exports = { notFoundHandler, errorHandler };
