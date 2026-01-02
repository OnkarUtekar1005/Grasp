const { prisma } = require('../config');
const { response, parsePagination, buildPaginationMeta, parseSort } = require('../utils');
const { imageService } = require('../services');
const path = require('path');

// Common include for gallery queries
const galleryInclude = {
  products: {
    include: {
      product: {
        include: {
          images: {
            orderBy: [{ isPrimary: 'desc' }, { sortOrder: 'asc' }],
            take: 1,
          },
          categories: {
            include: {
              category: true,
            },
          },
        },
      },
    },
  },
};

/**
 * Get all gallery images with filtering and pagination (public)
 */
async function getAll(req, res, next) {
  try {
    const { page, limit, skip } = parsePagination(req.query);
    const orderBy = parseSort(req.query, ['title', 'createdAt', 'sortOrder'], 'sortOrder');

    // Build where clause
    const where = { isActive: true };

    if (req.query.isFeatured === 'true') {
      where.isFeatured = true;
    }

    if (req.query.search) {
      where.OR = [
        { title: { contains: req.query.search, mode: 'insensitive' } },
        { description: { contains: req.query.search, mode: 'insensitive' } },
      ];
    }

    // Get gallery images and count
    const [images, total] = await Promise.all([
      prisma.galleryImage.findMany({
        where,
        include: galleryInclude,
        orderBy,
        skip,
        take: limit,
      }),
      prisma.galleryImage.count({ where }),
    ]);

    response.success(res, images, buildPaginationMeta(total, page, limit));
  } catch (error) {
    next(error);
  }
}

/**
 * Get featured gallery images (public)
 */
async function getFeatured(req, res, next) {
  try {
    const limit = parseInt(req.query.limit, 10) || 6;

    const images = await prisma.galleryImage.findMany({
      where: { isFeatured: true, isActive: true },
      include: galleryInclude,
      take: limit,
      orderBy: { sortOrder: 'asc' },
    });

    response.success(res, images);
  } catch (error) {
    next(error);
  }
}

/**
 * Get a single gallery image by ID (public)
 */
async function getById(req, res, next) {
  try {
    const { id } = req.params;

    const image = await prisma.galleryImage.findUnique({
      where: { id },
      include: galleryInclude,
    });

    if (!image) {
      return response.notFound(res, 'Gallery image not found');
    }

    response.success(res, image);
  } catch (error) {
    next(error);
  }
}

/**
 * Get all gallery images for admin (includes inactive)
 */
async function adminGetAll(req, res, next) {
  try {
    const { page, limit, skip } = parsePagination(req.query);
    const orderBy = parseSort(req.query, ['title', 'createdAt', 'sortOrder'], 'sortOrder');

    // Build where clause (no isActive filter for admin)
    const where = {};

    if (req.query.isActive !== undefined) {
      where.isActive = req.query.isActive === 'true';
    }
    if (req.query.isFeatured !== undefined) {
      where.isFeatured = req.query.isFeatured === 'true';
    }
    if (req.query.search) {
      where.OR = [
        { title: { contains: req.query.search, mode: 'insensitive' } },
        { description: { contains: req.query.search, mode: 'insensitive' } },
      ];
    }

    // Get gallery images and count
    const [images, total] = await Promise.all([
      prisma.galleryImage.findMany({
        where,
        include: galleryInclude,
        orderBy,
        skip,
        take: limit,
      }),
      prisma.galleryImage.count({ where }),
    ]);

    response.success(res, images, buildPaginationMeta(total, page, limit));
  } catch (error) {
    next(error);
  }
}

/**
 * Create a new gallery image (admin)
 */
async function create(req, res, next) {
  try {
    console.log('=== Gallery Image Create ===');
    console.log('Body:', req.body);
    console.log('File:', req.file);

    let { title, description, altText, isFeatured, isActive, sortOrder, productIds } = req.body;

    if (!req.file) {
      return response.badRequest(res, 'Image file is required');
    }

    // Parse productIds if it's a JSON string
    if (typeof productIds === 'string') {
      try {
        productIds = JSON.parse(productIds);
      } catch (e) {
        console.warn('Failed to parse productIds JSON:', e.message);
        productIds = [];
      }
    }

    // Create gallery image
    const galleryImage = await prisma.galleryImage.create({
      data: {
        title,
        description: description || null,
        imageUrl: `/uploads/gallery/${req.file.filename}`,
        altText: altText || null,
        isFeatured: isFeatured === 'true' || isFeatured === true,
        isActive: isActive !== 'false' && isActive !== false,
        sortOrder: parseInt(sortOrder, 10) || 0,
        // Create product associations if productIds provided
        products: Array.isArray(productIds) && productIds.length > 0
          ? {
              create: productIds.map((productId) => ({
                productId,
              })),
            }
          : undefined,
      },
      include: galleryInclude,
    });

    console.log('Gallery image created:', galleryImage.id);
    response.created(res, galleryImage);
  } catch (error) {
    console.error('Gallery image create error:', error);
    // Delete uploaded file on error
    if (req.file) {
      const uploadDir = process.env.UPLOAD_DIR || './uploads';
      await imageService.deleteImage(path.join(uploadDir, 'gallery', req.file.filename)).catch(() => {});
    }
    next(error);
  }
}

/**
 * Update a gallery image (admin)
 */
async function update(req, res, next) {
  try {
    const { id } = req.params;
    console.log('=== Gallery Image Update ===');
    console.log('ID:', id);
    console.log('Body:', req.body);
    console.log('File:', req.file);

    let { title, description, altText, isFeatured, isActive, sortOrder, productIds } = req.body;

    // Check if gallery image exists
    const existing = await prisma.galleryImage.findUnique({
      where: { id },
      include: { products: true },
    });

    if (!existing) {
      // Delete uploaded file if gallery image doesn't exist
      if (req.file) {
        const uploadDir = process.env.UPLOAD_DIR || './uploads';
        await imageService.deleteImage(path.join(uploadDir, 'gallery', req.file.filename)).catch(() => {});
      }
      return response.notFound(res, 'Gallery image not found');
    }

    // Parse productIds if it's a JSON string
    if (typeof productIds === 'string') {
      try {
        productIds = JSON.parse(productIds);
      } catch (e) {
        console.warn('Failed to parse productIds JSON:', e.message);
        productIds = undefined;
      }
    }

    // Build update data
    const updateData = {};

    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description || null;
    if (altText !== undefined) updateData.altText = altText || null;
    if (isFeatured !== undefined) updateData.isFeatured = isFeatured === 'true' || isFeatured === true;
    if (isActive !== undefined) updateData.isActive = isActive !== 'false' && isActive !== false;
    if (sortOrder !== undefined) updateData.sortOrder = parseInt(sortOrder, 10) || 0;

    // Handle new image upload
    if (req.file) {
      // Delete old image
      const uploadDir = process.env.UPLOAD_DIR || './uploads';
      await imageService.deleteImage(path.join(uploadDir, existing.imageUrl.replace('/uploads/', ''))).catch(() => {});
      updateData.imageUrl = `/uploads/gallery/${req.file.filename}`;
    }

    // Update gallery image
    let galleryImage = await prisma.galleryImage.update({
      where: { id },
      data: updateData,
      include: galleryInclude,
    });

    // Update product associations if productIds provided
    if (Array.isArray(productIds)) {
      // Delete existing associations
      await prisma.galleryImageProduct.deleteMany({ where: { galleryImageId: id } });
      // Create new associations
      if (productIds.length > 0) {
        await prisma.galleryImageProduct.createMany({
          data: productIds.map((productId) => ({
            galleryImageId: id,
            productId,
          })),
        });
      }
      // Refetch with updated associations
      galleryImage = await prisma.galleryImage.findUnique({
        where: { id },
        include: galleryInclude,
      });
    }

    console.log('Gallery image updated:', galleryImage.id);
    response.success(res, galleryImage);
  } catch (error) {
    console.error('Gallery image update error:', error);
    next(error);
  }
}

/**
 * Delete a gallery image (admin)
 */
async function remove(req, res, next) {
  try {
    const { id } = req.params;

    // Check if gallery image exists
    const existing = await prisma.galleryImage.findUnique({
      where: { id },
    });

    if (!existing) {
      return response.notFound(res, 'Gallery image not found');
    }

    // Delete image file
    const uploadDir = process.env.UPLOAD_DIR || './uploads';
    await imageService.deleteImage(path.join(uploadDir, existing.imageUrl.replace('/uploads/', ''))).catch(() => {});

    // Delete gallery image (cascades to product associations)
    await prisma.galleryImage.delete({
      where: { id },
    });

    response.noContent(res);
  } catch (error) {
    next(error);
  }
}

/**
 * Bulk update sort order (admin)
 */
async function updateOrder(req, res, next) {
  try {
    const { items } = req.body;

    if (!Array.isArray(items)) {
      return response.badRequest(res, 'Items array is required');
    }

    // Update each item's sort order
    await Promise.all(
      items.map((item) =>
        prisma.galleryImage.update({
          where: { id: item.id },
          data: { sortOrder: item.sortOrder },
        })
      )
    );

    response.success(res, { message: 'Sort order updated successfully' });
  } catch (error) {
    next(error);
  }
}

/**
 * Link products to a gallery image (admin)
 */
async function linkProducts(req, res, next) {
  try {
    const { id } = req.params;
    const { productIds } = req.body;

    // Check if gallery image exists
    const existing = await prisma.galleryImage.findUnique({
      where: { id },
    });

    if (!existing) {
      return response.notFound(res, 'Gallery image not found');
    }

    if (!Array.isArray(productIds)) {
      return response.badRequest(res, 'productIds array is required');
    }

    // Delete existing associations
    await prisma.galleryImageProduct.deleteMany({ where: { galleryImageId: id } });

    // Create new associations
    if (productIds.length > 0) {
      await prisma.galleryImageProduct.createMany({
        data: productIds.map((productId) => ({
          galleryImageId: id,
          productId,
        })),
        skipDuplicates: true,
      });
    }

    // Fetch updated gallery image
    const galleryImage = await prisma.galleryImage.findUnique({
      where: { id },
      include: galleryInclude,
    });

    response.success(res, galleryImage);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getAll,
  getFeatured,
  getById,
  adminGetAll,
  create,
  update,
  remove,
  updateOrder,
  linkProducts,
};
