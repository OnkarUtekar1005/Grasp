const { prisma } = require('../config');
const { authService } = require('../services');
const { response } = require('../utils');

/**
 * Get all admins
 */
async function getAll(req, res, next) {
  try {
    const admins = await prisma.adminUser.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        isActive: true,
        lastLoginAt: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    response.success(res, admins);
  } catch (error) {
    next(error);
  }
}

/**
 * Create a new admin
 */
async function create(req, res, next) {
  try {
    const { email, password, name } = req.body;

    // Check if email already exists
    const existing = await prisma.adminUser.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existing) {
      return response.conflict(res, 'An admin with this email already exists');
    }

    // Hash password
    const passwordHash = await authService.hashPassword(password);

    // Create admin
    const admin = await prisma.adminUser.create({
      data: {
        email: email.toLowerCase(),
        passwordHash,
        name,
      },
      select: {
        id: true,
        email: true,
        name: true,
        isActive: true,
        createdAt: true,
      },
    });

    response.created(res, admin);
  } catch (error) {
    next(error);
  }
}

/**
 * Update an admin
 */
async function update(req, res, next) {
  try {
    const { id } = req.params;
    const { email, name, isActive } = req.body;

    // Check if admin exists
    const existing = await prisma.adminUser.findUnique({
      where: { id },
    });

    if (!existing) {
      return response.notFound(res, 'Admin not found');
    }

    // Check email uniqueness if changing
    if (email && email.toLowerCase() !== existing.email) {
      const emailExists = await prisma.adminUser.findUnique({
        where: { email: email.toLowerCase() },
      });

      if (emailExists) {
        return response.conflict(res, 'An admin with this email already exists');
      }
    }

    // Update admin
    const admin = await prisma.adminUser.update({
      where: { id },
      data: {
        ...(email && { email: email.toLowerCase() }),
        ...(name && { name }),
        ...(typeof isActive === 'boolean' && { isActive }),
      },
      select: {
        id: true,
        email: true,
        name: true,
        isActive: true,
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // If deactivating, invalidate all sessions
    if (isActive === false) {
      await authService.deleteAllSessions(id);
    }

    response.success(res, admin);
  } catch (error) {
    next(error);
  }
}

/**
 * Delete an admin
 */
async function remove(req, res, next) {
  try {
    const { id } = req.params;

    // Prevent self-deletion
    if (id === req.admin.id) {
      return response.badRequest(res, 'You cannot delete your own account');
    }

    // Check if admin exists
    const existing = await prisma.adminUser.findUnique({
      where: { id },
    });

    if (!existing) {
      return response.notFound(res, 'Admin not found');
    }

    // Delete admin (sessions will cascade delete)
    await prisma.adminUser.delete({
      where: { id },
    });

    response.noContent(res);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getAll,
  create,
  update,
  remove,
};
