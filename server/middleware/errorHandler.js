/**
 * Global error handler middleware.
 *
 * Catches all errors forwarded via next(error) and returns a consistent
 * JSON response shape. Handles specific error types from Mongoose, JWT,
 * and Multer to provide actionable client-facing messages.
 */
const errorHandler = (err, req, res, next) => {
  // Log full stack trace for debugging (server-side only)
  console.error(`[${new Date().toISOString()}] ${err.name}: ${err.message}`);
  if (process.env.NODE_ENV !== 'production') {
    console.error(err.stack);
  }

  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message = err.message || 'Internal Server Error';

  // ── Mongoose: CastError (e.g. invalid ObjectId) ──────────────────────
  if (err.name === 'CastError' && err.kind === 'ObjectId') {
    statusCode = 404;
    message = 'Resource not found — the provided ID is invalid';
  }

  // ── Mongoose: ValidationError (schema validation failures) ───────────
  if (err.name === 'ValidationError') {
    statusCode = 400;
    const fields = Object.values(err.errors).map((e) => e.message);
    message = `Validation failed: ${fields.join('. ')}`;
  }

  // ── Mongoose: Duplicate key error (unique constraint) ────────────────
  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue).join(', ');
    message = `Duplicate value entered for ${field}. Please use a different value`;
  }

  // ── JWT: Token expired ───────────────────────────────────────────────
  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Session expired. Please log in again';
  }

  // ── JWT: Malformed or invalid token ──────────────────────────────────
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid authentication token. Please log in again';
  }

  // ── Multer: File too large ───────────────────────────────────────────
  if (err.code === 'LIMIT_FILE_SIZE') {
    statusCode = 413;
    message = 'File is too large. Maximum upload size is 5 MB';
  }

  // ── Multer: Unexpected field name ────────────────────────────────────
  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    statusCode = 400;
    message = 'Unexpected file field. Please check the upload field name';
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
  });
};

module.exports = errorHandler;
