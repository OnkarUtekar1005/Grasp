const { prisma } = require('../config');
const { authService } = require('../services');
const { response } = require('../utils');

/**
 * Admin login
 */
async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    // Find admin by email
    const admin = await prisma.adminUser.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!admin) {
      return response.unauthorized(res, 'Invalid email or password');
    }

    if (!admin.isActive) {
      return response.unauthorized(res, 'Account is deactivated');
    }

    // Verify password
    const isValid = await authService.comparePassword(password, admin.passwordHash);
    if (!isValid) {
      return response.unauthorized(res, 'Invalid email or password');
    }

    // Generate token
    const token = authService.generateToken({ id: admin.id, email: admin.email });

    // Create session
    await authService.createSession(admin.id, token, {
      ip: req.ip,
      userAgent: req.get('user-agent'),
    });

    // Update last login
    await authService.updateLastLogin(admin.id);

    // Return token and admin info
    response.success(res, {
      token,
      admin: {
        id: admin.id,
        email: admin.email,
        name: admin.name,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Admin logout
 */
async function logout(req, res, next) {
  try {
    await authService.deleteSession(req.sessionId);
    response.success(res, { message: 'Logged out successfully' });
  } catch (error) {
    next(error);
  }
}

/**
 * Get current admin profile
 */
async function me(req, res, next) {
  try {
    const admin = await prisma.adminUser.findUnique({
      where: { id: req.admin.id },
      select: {
        id: true,
        email: true,
        name: true,
        lastLoginAt: true,
        createdAt: true,
      },
    });

    response.success(res, admin);
  } catch (error) {
    next(error);
  }
}

/**
 * Change password
 */
async function changePassword(req, res, next) {
  try {
    const { currentPassword, newPassword } = req.body;

    // Get admin with password
    const admin = await prisma.adminUser.findUnique({
      where: { id: req.admin.id },
    });

    // Verify current password
    const isValid = await authService.comparePassword(currentPassword, admin.passwordHash);
    if (!isValid) {
      return response.badRequest(res, 'Current password is incorrect');
    }

    // Hash new password
    const passwordHash = await authService.hashPassword(newPassword);

    // Update password
    await prisma.adminUser.update({
      where: { id: admin.id },
      data: { passwordHash },
    });

    // Invalidate all other sessions
    await authService.deleteAllSessions(admin.id);

    response.success(res, { message: 'Password changed successfully. Please login again.' });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  login,
  logout,
  me,
  changePassword,
};
