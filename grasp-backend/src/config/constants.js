module.exports = {
  // Pagination defaults
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,

  // File upload
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
  ALLOWED_DOCUMENT_TYPES: ['application/pdf'],
  MAX_FILE_SIZE: parseInt(process.env.MAX_FILE_SIZE, 10) || 5 * 1024 * 1024, // 5MB
  IMAGE_SIZES: {
    thumbnail: { width: 150, height: 150 },
    medium: { width: 600, height: 600 },
    large: { width: 1200, height: 1200 },
  },

  // JWT
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',

  // Quote request number prefix
  QUOTE_PREFIX: 'QR',

  // Status values (matching Prisma enums)
  QUOTE_STATUS: {
    PENDING: 'PENDING',
    REVIEWED: 'REVIEWED',
    QUOTED: 'QUOTED',
    ACCEPTED: 'ACCEPTED',
    REJECTED: 'REJECTED',
    EXPIRED: 'EXPIRED',
  },

  INQUIRY_STATUS: {
    NEW: 'NEW',
    READ: 'READ',
    REPLIED: 'REPLIED',
    CLOSED: 'CLOSED',
  },

  INQUIRY_TYPE: {
    GENERAL: 'GENERAL',
    SUPPORT: 'SUPPORT',
    PARTNERSHIP: 'PARTNERSHIP',
    OTHER: 'OTHER',
  },

  DOCUMENT_TYPE: {
    DATASHEET: 'DATASHEET',
    MANUAL: 'MANUAL',
    CERTIFICATE: 'CERTIFICATE',
    CAD: 'CAD',
    OTHER: 'OTHER',
  },
};
