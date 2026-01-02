const { response } = require('../utils');

/**
 * Middleware factory for Zod schema validation
 * @param {object} schema - Zod schema object with optional body, query, params
 * @returns {Function} Express middleware
 */
function validate(schema) {
  return (req, res, next) => {
    const errors = [];

    // Validate body
    if (schema.body) {
      const result = schema.body.safeParse(req.body);
      if (!result.success) {
        errors.push(
          ...result.error.errors.map((e) => ({
            field: `body.${e.path.join('.')}`,
            message: e.message,
          }))
        );
      } else {
        req.body = result.data;
      }
    }

    // Validate query
    if (schema.query) {
      const result = schema.query.safeParse(req.query);
      if (!result.success) {
        errors.push(
          ...result.error.errors.map((e) => ({
            field: `query.${e.path.join('.')}`,
            message: e.message,
          }))
        );
      } else {
        req.query = result.data;
      }
    }

    // Validate params
    if (schema.params) {
      const result = schema.params.safeParse(req.params);
      if (!result.success) {
        const errorList = result.error?.errors || [];
        errors.push(
          ...errorList.map((e) => ({
            field: `params.${e.path.join('.')}`,
            message: e.message,
          }))
        );
        // If no detailed errors, add a generic one
        if (errorList.length === 0) {
          errors.push({
            field: 'params',
            message: 'Invalid request parameters',
          });
        }
      } else {
        req.params = result.data;
      }
    }

    if (errors.length > 0) {
      return response.validationError(res, errors);
    }

    next();
  };
}

module.exports = { validate };
