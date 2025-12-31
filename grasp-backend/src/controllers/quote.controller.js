const { prisma } = require('../config');
const { response, parsePagination, buildPaginationMeta, parseSort } = require('../utils');
const { emailService } = require('../services');

/**
 * Generate quote request number
 */
async function generateRequestNumber() {
  const year = new Date().getFullYear();
  const prefix = `QR-${year}-`;

  // Find the latest quote number for this year
  const latest = await prisma.quoteRequest.findFirst({
    where: { requestNumber: { startsWith: prefix } },
    orderBy: { requestNumber: 'desc' },
  });

  let nextNum = 1;
  if (latest) {
    const currentNum = parseInt(latest.requestNumber.replace(prefix, ''), 10);
    nextNum = currentNum + 1;
  }

  return `${prefix}${String(nextNum).padStart(5, '0')}`;
}

/**
 * Submit a quote request (public)
 */
async function submit(req, res, next) {
  try {
    const { companyName, contactName, email, phone, message, items } = req.body;

    // Validate that all products exist
    const productIds = items.map((item) => item.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
    });

    if (products.length !== productIds.length) {
      return response.badRequest(res, 'One or more products not found');
    }

    // Validate variants if provided
    const variantIds = items.filter((item) => item.variantId).map((item) => item.variantId);
    if (variantIds.length > 0) {
      const variants = await prisma.productVariant.findMany({
        where: { id: { in: variantIds } },
      });

      if (variants.length !== variantIds.length) {
        return response.badRequest(res, 'One or more variants not found');
      }
    }

    // Generate request number
    const requestNumber = await generateRequestNumber();

    // Create quote request with items
    const quote = await prisma.quoteRequest.create({
      data: {
        requestNumber,
        companyName,
        contactName,
        email,
        phone,
        message,
        items: {
          create: items.map((item) => ({
            productId: item.productId,
            variantId: item.variantId || null,
            quantity: item.quantity,
            notes: item.notes || null,
          })),
        },
      },
      include: {
        items: {
          include: {
            product: true,
            variant: true,
          },
        },
      },
    });

    // Send email notification to admins
    emailService.notifyNewQuoteRequest(quote).catch((err) => {
      console.error('Failed to send quote notification:', err);
    });

    response.created(res, {
      requestNumber: quote.requestNumber,
      message: 'Quote request submitted successfully. We will contact you soon.',
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get all quote requests (admin)
 */
async function getAll(req, res, next) {
  try {
    const { page, limit, skip } = parsePagination(req.query);
    const orderBy = parseSort(req.query, ['createdAt', 'requestNumber', 'status'], 'createdAt');

    // Build where clause
    const where = {};

    if (req.query.status) {
      where.status = req.query.status;
    }
    if (req.query.search) {
      where.OR = [
        { requestNumber: { contains: req.query.search, mode: 'insensitive' } },
        { companyName: { contains: req.query.search, mode: 'insensitive' } },
        { contactName: { contains: req.query.search, mode: 'insensitive' } },
        { email: { contains: req.query.search, mode: 'insensitive' } },
      ];
    }

    const [quotes, total] = await Promise.all([
      prisma.quoteRequest.findMany({
        where,
        include: {
          items: {
            include: {
              product: { select: { id: true, name: true, code: true } },
              variant: { select: { id: true, name: true, sku: true } },
            },
          },
          _count: { select: { items: true } },
        },
        orderBy,
        skip,
        take: limit,
      }),
      prisma.quoteRequest.count({ where }),
    ]);

    response.success(res, quotes, buildPaginationMeta(total, page, limit));
  } catch (error) {
    next(error);
  }
}

/**
 * Get a quote request by ID (admin)
 */
async function getById(req, res, next) {
  try {
    const { id } = req.params;

    const quote = await prisma.quoteRequest.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: true,
            variant: true,
          },
        },
        statusHistory: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!quote) {
      return response.notFound(res, 'Quote request not found');
    }

    response.success(res, quote);
  } catch (error) {
    next(error);
  }
}

/**
 * Update a quote request (admin)
 */
async function update(req, res, next) {
  try {
    const { id } = req.params;
    const { status, internalNotes, quoteValidUntil, totalQuotedAmount, items } = req.body;

    // Check if quote exists
    const existing = await prisma.quoteRequest.findUnique({
      where: { id },
    });

    if (!existing) {
      return response.notFound(res, 'Quote request not found');
    }

    // Build update data
    const updateData = {};

    if (status) {
      updateData.status = status;
      // If status is QUOTED, set quotedAt
      if (status === 'QUOTED' && existing.status !== 'QUOTED') {
        updateData.quotedAt = new Date();
      }
    }
    if (internalNotes !== undefined) updateData.internalNotes = internalNotes;
    if (quoteValidUntil !== undefined) updateData.quoteValidUntil = quoteValidUntil ? new Date(quoteValidUntil) : null;
    if (totalQuotedAmount !== undefined) updateData.totalQuotedAmount = totalQuotedAmount;

    // Update quote
    let quote = await prisma.quoteRequest.update({
      where: { id },
      data: updateData,
    });

    // Log status change
    if (status && status !== existing.status) {
      await prisma.quoteStatusHistory.create({
        data: {
          quoteRequestId: id,
          oldStatus: existing.status,
          newStatus: status,
        },
      });
    }

    // Update items if provided
    if (items && items.length > 0) {
      for (const item of items) {
        if (item.id) {
          await prisma.quoteRequestItem.update({
            where: { id: item.id },
            data: {
              ...(item.quotedUnitPrice !== undefined && { quotedUnitPrice: item.quotedUnitPrice }),
              ...(item.quotedTotal !== undefined && { quotedTotal: item.quotedTotal }),
              ...(item.notes !== undefined && { notes: item.notes }),
            },
          });
        }
      }
    }

    // Fetch updated quote
    quote = await prisma.quoteRequest.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: true,
            variant: true,
          },
        },
        statusHistory: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    response.success(res, quote);
  } catch (error) {
    next(error);
  }
}

/**
 * Delete a quote request (admin)
 */
async function remove(req, res, next) {
  try {
    const { id } = req.params;

    // Check if quote exists
    const existing = await prisma.quoteRequest.findUnique({
      where: { id },
    });

    if (!existing) {
      return response.notFound(res, 'Quote request not found');
    }

    // Delete quote (items and history will cascade)
    await prisma.quoteRequest.delete({
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
