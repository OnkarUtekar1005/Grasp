const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { prisma } = require('../config');
const { constants } = require('../config');

const SALT_ROUNDS = 12;

/**
 * Hash a password
 * @param {string} password - Plain text password
 * @returns {Promise<string>} - Hashed password
 */
async function hashPassword(password) {
  return bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Compare password with hash
 * @param {string} password - Plain text password
 * @param {string} hash - Hashed password
 * @returns {Promise<boolean>} - Match result
 */
async function comparePassword(password, hash) {
  return bcrypt.compare(password, hash);
}

/**
 * Generate JWT token
 * @param {object} payload - Token payload
 * @returns {string} - JWT token
 */
function generateToken(payload) {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: constants.JWT_EXPIRES_IN,
  });
}

/**
 * Create a session for admin
 * @param {string} adminId - Admin user ID
 * @param {string} token - JWT token
 * @param {object} meta - Request metadata (ip, userAgent)
 * @returns {Promise<object>} - Created session
 */
async function createSession(adminId, token, meta = {}) {
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

  // Calculate expiry from JWT_EXPIRES_IN
  const expiresIn = constants.JWT_EXPIRES_IN;
  let expiresMs = 7 * 24 * 60 * 60 * 1000; // Default 7 days

  if (expiresIn.endsWith('d')) {
    expiresMs = parseInt(expiresIn) * 24 * 60 * 60 * 1000;
  } else if (expiresIn.endsWith('h')) {
    expiresMs = parseInt(expiresIn) * 60 * 60 * 1000;
  }

  const expiresAt = new Date(Date.now() + expiresMs);

  return prisma.adminSession.create({
    data: {
      adminId,
      tokenHash,
      ipAddress: meta.ip || null,
      userAgent: meta.userAgent || null,
      expiresAt,
    },
  });
}

/**
 * Delete a session
 * @param {string} sessionId - Session ID
 */
async function deleteSession(sessionId) {
  return prisma.adminSession.delete({
    where: { id: sessionId },
  });
}

/**
 * Delete all sessions for an admin
 * @param {string} adminId - Admin user ID
 */
async function deleteAllSessions(adminId) {
  return prisma.adminSession.deleteMany({
    where: { adminId },
  });
}

/**
 * Clean up expired sessions
 */
async function cleanupExpiredSessions() {
  return prisma.adminSession.deleteMany({
    where: {
      expiresAt: { lt: new Date() },
    },
  });
}

/**
 * Update last login timestamp
 * @param {string} adminId - Admin user ID
 */
async function updateLastLogin(adminId) {
  return prisma.adminUser.update({
    where: { id: adminId },
    data: { lastLoginAt: new Date() },
  });
}

module.exports = {
  hashPassword,
  comparePassword,
  generateToken,
  createSession,
  deleteSession,
  deleteAllSessions,
  cleanupExpiredSessions,
  updateLastLogin,
};
