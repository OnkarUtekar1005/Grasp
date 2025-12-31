const { prisma } = require('../config');
const { response, parsePagination, buildPaginationMeta, parseSort } = require('../utils');
const { emailService } = require('../services');

/**
 * Submit an inquiry (public)
 */
async function submit(req, res, next) {
  try {
    const { inquiryType, companyName, contactName, email, phone, subject, message } = req.body;

    // Create inquiry
    const inquiry = await prisma.inquiry.create({
      data: {
        inquiryType,
        companyName,
        contactName,
        email,
        phone,
        subject,
        message,
      },
    });

    // Send email notification to admins
    emailService.notifyNewInquiry(inquiry).catch((err) => {
      console.error('Failed to send inquiry notification:', err);
    });

    response.created(res, {
      message: 'Thank you for your inquiry. We will get back to you soon.',
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get all inquiries (admin)
 */
async function getAll(req, res, next) {
  try {
    const { page, limit, skip } = parsePagination(req.query);
    const orderBy = parseSort(req.query, ['createdAt', 'status', 'inquiryType'], 'createdAt');

    // Build where clause
    const where = {};

    if (req.query.status) {
      where.status = req.query.status;
    }
    if (req.query.type) {
      where.inquiryType = req.query.type;
    }
    if (req.query.search) {
      where.OR = [
        { contactName: { contains: req.query.search, mode: 'insensitive' } },
        { companyName: { contains: req.query.search, mode: 'insensitive' } },
        { email: { contains: req.query.search, mode: 'insensitive' } },
        { subject: { contains: req.query.search, mode: 'insensitive' } },
        { message: { contains: req.query.search, mode: 'insensitive' } },
      ];
    }

    const [inquiries, total] = await Promise.all([
      prisma.inquiry.findMany({
        where,
        orderBy,
        skip,
        take: limit,
      }),
      prisma.inquiry.count({ where }),
    ]);

    response.success(res, inquiries, buildPaginationMeta(total, page, limit));
  } catch (error) {
    next(error);
  }
}

/**
 * Get an inquiry by ID (admin)
 */
async function getById(req, res, next) {
  try {
    const { id } = req.params;

    const inquiry = await prisma.inquiry.findUnique({
      where: { id },
    });

    if (!inquiry) {
      return response.notFound(res, 'Inquiry not found');
    }

    // Mark as read if new
    if (inquiry.status === 'NEW') {
      await prisma.inquiry.update({
        where: { id },
        data: { status: 'READ' },
      });
      inquiry.status = 'READ';
    }

    response.success(res, inquiry);
  } catch (error) {
    next(error);
  }
}

/**
 * Update an inquiry (admin)
 */
async function update(req, res, next) {
  try {
    const { id } = req.params;
    const { status, internalNotes } = req.body;

    // Check if inquiry exists
    const existing = await prisma.inquiry.findUnique({
      where: { id },
    });

    if (!existing) {
      return response.notFound(res, 'Inquiry not found');
    }

    // Update inquiry
    const inquiry = await prisma.inquiry.update({
      where: { id },
      data: {
        ...(status && { status }),
        ...(internalNotes !== undefined && { internalNotes }),
      },
    });

    response.success(res, inquiry);
  } catch (error) {
    next(error);
  }
}

/**
 * Delete an inquiry (admin)
 */
async function remove(req, res, next) {
  try {
    const { id } = req.params;

    // Check if inquiry exists
    const existing = await prisma.inquiry.findUnique({
      where: { id },
    });

    if (!existing) {
      return response.notFound(res, 'Inquiry not found');
    }

    // Delete inquiry
    await prisma.inquiry.delete({
      where: { id },
    });

    response.noContent(res);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  submit,
  getAll,
  getById,
  update,
  remove,
};
