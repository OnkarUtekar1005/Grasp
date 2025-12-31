const jwt = require('jsonwebtoken');
const { prisma } = require('../config');
const { response } = require('../utils');
const crypto = require('crypto');

/**
 * Middleware to verify JWT token and attach admin to request
 */
async function authenticate(req, res, next) {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return response.unauthorized(res, 'No token provided');
    }

    const token = authHeader.split(' ')[1];

    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return response.unauthorized(res, 'Token expired');
      }
      return response.unauthorized(res, 'Invalid token');
    }

    // Hash the token to check against stored sessions
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    // Check if session exists and is valid
    const session = await prisma.adminSession.findUnique({
      where: { tokenHash },
      include: { admin: true },
    });

    if (!session) {
      return response.unauthorized(res, 'Session not found');
    }

    if (new Date() > session.expiresAt) {
      // Clean up expired session
      await prisma.adminSession.delete({ where: { id: session.id } });
      return response.unauthorized(res, 'Session expired');
    }

    if (!session.admin.isActive) {
      return response.unauthorized(res, 'Account is deactivated');
    }

    // Attach admin to request
    req.admin = session.admin;
    req.sessionId = session.id;

    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return response.serverError(res, 'Authentication error');
  }
}

module.exports = { authenticate };
