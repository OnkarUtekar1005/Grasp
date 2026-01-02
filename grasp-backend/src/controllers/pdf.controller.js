const { PrismaClient } = require('@prisma/client');
const { response } = require('../utils');
const pdfService = require('../services/pdf.service');
const { logger } = require('../utils');

const prisma = new PrismaClient();

/**
 * Generate and download PDF for a product
 * GET /api/v1/pdf/products/:slug
 */
const generateProductPDF = async (req, res, next) => {
  try {
    const { slug } = req.params;

    // Fetch product with all relations needed for PDF
    const product = await prisma.product.findUnique({
      where: { slug },
      include: {
        category: true,
        categories: {
          include: {
            category: true
          }
        },
        variants: {
          orderBy: { sortOrder: 'asc' }
        },
        images: {
          orderBy: [
            { isPrimary: 'desc' },
            { sortOrder: 'asc' }
          ]
        },
        documents: {
          orderBy: { createdAt: 'desc' }
        },
        features: {
          orderBy: { sortOrder: 'asc' }
        },
        dynamicSpecs: {
          orderBy: { sortOrder: 'asc' }
        }
      }
    });

    if (!product) {
      return response.notFound(res, 'Product not found');
    }

    // Get base URL for images
    const protocol = req.protocol;
    const host = req.get('host');
    const baseUrl = `${protocol}://${host}`;

    logger.info(`Generating PDF for product: ${product.name} (${slug})`);

    // Generate PDF
    const pdfBuffer = await pdfService.generateProductPDF(product, baseUrl);

    // Set response headers for PDF download
    const filename = `${product.slug}-datasheet.pdf`;
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', pdfBuffer.length);

    // Send PDF
    res.send(pdfBuffer);

    logger.info(`PDF generated successfully for: ${product.name}`);
  } catch (error) {
    logger.error('Error generating product PDF:', error);
    next(error);
  }
};

module.exports = {
  generateProductPDF
};
