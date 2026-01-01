const { prisma } = require('../config');
const { response } = require('../utils');

/**
 * Get dashboard statistics (admin)
 */
async function getStats(req, res, next) {
  try {
    // Get counts in parallel
    const [
      totalProducts,
      activeProducts,
      totalCategories,
      totalQuotes,
      pendingQuotes,
      totalInquiries,
      newInquiries,
      lowStockVariants,
      recentQuotes,
      recentInquiries,
    ] = await Promise.all([
      // Product counts
      prisma.product.count(),
      prisma.product.count({ where: { isActive: true } }),

      // Category count
      prisma.category.count(),

      // Quote counts
      prisma.quoteRequest.count(),
      prisma.quoteRequest.count({ where: { status: 'PENDING' } }),

      // Inquiry counts
      prisma.inquiry.count(),
      prisma.inquiry.count({ where: { status: 'NEW' } }),

      // Low stock variants - count variants where stockQuantity <= lowStockThreshold
      // Using raw query since Prisma doesn't support comparing two columns
      prisma.$queryRaw`
        SELECT COUNT(*)::int as count
        FROM product_variants
        WHERE stock_quantity <= low_stock_threshold
        AND is_active = true
      `.then(result => result[0]?.count || 0),

      // Recent quotes
      prisma.quoteRequest.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          requestNumber: true,
          companyName: true,
          status: true,
          createdAt: true,
        },
      }),

      // Recent inquiries
      prisma.inquiry.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          contactName: true,
          subject: true,
          inquiryType: true,
          status: true,
          createdAt: true,
        },
      }),
    ]);

    // Quote status breakdown
    const quotesByStatus = await prisma.quoteRequest.groupBy({
      by: ['status'],
      _count: { status: true },
    });

    // Inquiry status breakdown
    const inquiriesByStatus = await prisma.inquiry.groupBy({
      by: ['status'],
      _count: { status: true },
    });

    response.success(res, {
      products: {
        total: totalProducts,
        active: activeProducts,
        inactive: totalProducts - activeProducts,
      },
      categories: {
        total: totalCategories,
      },
      quotes: {
        total: totalQuotes,
        pending: pendingQuotes,
        byStatus: quotesByStatus.reduce((acc, item) => {
          acc[item.status] = item._count.status;
          return acc;
        }, {}),
      },
      inquiries: {
        total: totalInquiries,
        new: newInquiries,
        byStatus: inquiriesByStatus.reduce((acc, item) => {
          acc[item.status] = item._count.status;
          return acc;
        }, {}),
      },
      inventory: {
        lowStock: lowStockVariants,
      },
      recent: {
        quotes: recentQuotes,
        inquiries: recentInquiries,
      },
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getStats,
};
