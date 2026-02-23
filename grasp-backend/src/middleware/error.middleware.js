const { logger, response } = require('../utils');

/**
 * Global error handling middleware
 */
function errorHandler(err, req, res, next) {
  // Log the error
  logger.error({
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
  });

  // Prisma errors
  if (err.code) {
    switch (err.code) {
      case 'P2002': // Unique constraint violation
        return response.conflict(res, 'A record with this value already exists');
      case 'P2025': // Record not found
        return response.notFound(res, 'Record not found');
      case 'P2003': // Foreign key constraint failed
        return response.badRequest(res, 'Related record not found');
      default:
        break;
    }
  }

  // Multer errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    return response.badRequest(res, 'File size too large');
  }
  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    return response.badRequest(res, 'Unexpected file field');
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return response.unauthorized(res, 'Invalid token');
  }
  if (err.name === 'TokenExpiredError') {
    return response.unauthorized(res, 'Token expired');
  }

  // Zod validation errors
  if (err.name === 'ZodError') {
    const details = err.issues.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
    }));
    return response.validationError(res, details);
  }

  // Default to 500 server error
  const message =
    process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message;

  return response.serverError(res, message);
}

/**
 * 404 Not Found handler
 */
function notFoundHandler(req, res) {
  return response.notFound(res, `Route ${req.method} ${req.path} not found`);
}

module.exports = {
  errorHandler,
  notFoundHandler,
};
