const { DEFAULT_PAGE, DEFAULT_LIMIT, MAX_LIMIT } = require('../config/constants');

/**
 * Parse and validate pagination parameters from query
 * @param {object} query - Express query object
 * @returns {object} - { page, limit, skip }
 */
function parsePagination(query) {
  let page = parseInt(query.page, 10) || DEFAULT_PAGE;
  let limit = parseInt(query.limit, 10) || DEFAULT_LIMIT;

  // Ensure positive values
  page = Math.max(1, page);
  limit = Math.max(1, Math.min(limit, MAX_LIMIT));

  const skip = (page - 1) * limit;

  return { page, limit, skip };
}

/**
 * Build pagination metadata for response
 * @param {number} total - Total number of items
 * @param {number} page - Current page
 * @param {number} limit - Items per page
 * @returns {object} - Pagination metadata
 */
function buildPaginationMeta(total, page, limit) {
  const totalPages = Math.ceil(total / limit);

  return {
    page,
    limit,
    total,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  };
}

/**
 * Parse sort parameters from query
 * @param {object} query - Express query object
 * @param {string[]} allowedFields - Fields allowed for sorting
 * @param {string} defaultField - Default sort field
 * @returns {object} - Prisma orderBy object
 */
function parseSort(query, allowedFields, defaultField = 'createdAt') {
  const sortField = allowedFields.includes(query.sort) ? query.sort : defaultField;
  const sortOrder = query.order === 'asc' ? 'asc' : 'desc';

  return { [sortField]: sortOrder };
}

module.exports = {
  parsePagination,
  buildPaginationMeta,
  parseSort,
};
