// Simple custom error class so services can throw errors with an HTTP status attached.
// e.g. throw new AppError(401, 'Invalid email or password');
class AppError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

// Centralized Express error handler — must be the last app.use() in app.js.
function errorMiddleware(err, req, res, next) {
  console.error(err);
  const status = err.status || 500;
  res.status(status).json({ error: err.message || 'Internal server error' });
}

module.exports = errorMiddleware;
module.exports.AppError = AppError;
