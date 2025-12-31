/**
 * Send a success response
 * @param {object} res - Express response object
 * @param {object} data - Response data
 * @param {object} meta - Optional metadata (pagination, etc.)
 * @param {number} statusCode - HTTP status code (default 200)
 */
function success(res, data, meta = null, statusCode = 200) {
  const response = {
    success: true,
    data,
  };

  if (meta) {
    response.meta = meta;
  }

  res.status(statusCode).json(response);
}

/**
 * Send a created response (201)
 * @param {object} res - Express response object
 * @param {object} data - Created resource data
 */
function created(res, data) {
  success(res, data, null, 201);
}

/**
 * Send a no content response (204)
 * @param {object} res - Express response object
 */
function noContent(res) {
  res.status(204).send();
}

/**
 * Send an error response
 * @param {object} res - Express response object
 * @param {string} code - Error code
 * @param {string} message - Error message
 * @param {number} statusCode - HTTP status code
 * @param {array} details - Optional error details
 */
function error(res, code, message, statusCode = 400, details = null) {
  const response = {
    success: false,
    error: {
      code,
      message,
    },
  };

  if (details) {
    response.error.details = details;
  }

  res.status(statusCode).json(response);
}

/**
 * Common error responses
 */
const errors = {
  badRequest: (res, message = 'Bad request', details = null) =>
    error(res, 'BAD_REQUEST', message, 400, details),

  unauthorized: (res, message = 'Unauthorized') =>
    error(res, 'UNAUTHORIZED', message, 401),

  forbidden: (res, message = 'Forbidden') =>
    error(res, 'FORBIDDEN', message, 403),

  notFound: (res, message = 'Resource not found') =>
    error(res, 'NOT_FOUND', message, 404),

  conflict: (res, message = 'Resource already exists') =>
    error(res, 'CONFLICT', message, 409),

  validationError: (res, details) =>
    error(res, 'VALIDATION_ERROR', 'Validation failed', 400, details),

  serverError: (res, message = 'Internal server error') =>
    error(res, 'SERVER_ERROR', message, 500),
};

module.exports = {
  success,
  created,
  noContent,
  error,
  ...errors,
};
