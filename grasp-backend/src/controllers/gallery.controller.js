const { prisma } = require('../config');
const { response, parsePagination, buildPaginationMeta, parseSort } = require('../utils');
const { imageService } = require('../services');
const path = require('path');

const galleryInclude = {
  files: { orderBy: { sortOrder: 'asc' } },
  products: {
    include: {
      product: {
        include: {
          images: {
            orderBy: [{ isPrimary: 'desc' }, { sortOrder: 'asc' }],
            take: 1,
          },
          categories: {
            include: { category: true },
          },
        },
      },
    },
  },
};

const uploadDir = () => process.env.UPLOAD_DIR || './uploads';

function parseMaybeJson(value, fallback) {
  if (value === undefined || value === null) return fallback;
  if (Array.isArray(value)) return value;
  if (typeof value === 'string') {
    try { return JSON.parse(value); } catch { return fallback; }
  }
  return fallback;
}

async function getAll(req, res, next) {
  try {
    const { page, limit, skip } = parsePagination(req.query);
    const orderBy = parseSort(req.query, ['title', 'createdAt', 'sortOrder'], 'sortOrder');
    const where = { isActive: true };

    if (req.query.isFeatured === 'true') where.isFeatured = true;
    if (req.query.search) {
      where.OR = [
        { title: { contains: req.query.search, mode: 'insensitive' } },
        { description: { contains: req.query.search, mode: 'insensitive' } },
      ];
    }

    const [images, total] = await Promise.all([
      prisma.galleryImage.findMany({ where, include: galleryInclude, orderBy, skip, take: limit }),
      prisma.galleryImage.count({ where }),
    ]);

    response.success(res, images, buildPaginationMeta(total, page, limit));
  } catch (error) { next(error); }
}

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
  } catch (error) { next(error); }
}

async function getById(req, res, next) {
  try {
    const image = await prisma.galleryImage.findUnique({
      where: { id: req.params.id },
      include: galleryInclude,
    });
    if (!image) return response.notFound(res, 'Gallery post not found');
    response.success(res, image);
  } catch (error) { next(error); }
}

async function adminGetAll(req, res, next) {
  try {
    const { page, limit, skip } = parsePagination(req.query);
    const orderBy = parseSort(req.query, ['title', 'createdAt', 'sortOrder'], 'sortOrder');
    const where = {};

    if (req.query.isActive !== undefined) where.isActive = req.query.isActive === 'true';
    if (req.query.isFeatured !== undefined) where.isFeatured = req.query.isFeatured === 'true';
    if (req.query.search) {
      where.OR = [
        { title: { contains: req.query.search, mode: 'insensitive' } },
        { description: { contains: req.query.search, mode: 'insensitive' } },
      ];
    }

    const [images, total] = await Promise.all([
      prisma.galleryImage.findMany({ where, include: galleryInclude, orderBy, skip, take: limit }),
      prisma.galleryImage.count({ where }),
    ]);

    response.success(res, images, buildPaginationMeta(total, page, limit));
  } catch (error) { next(error); }
}

async function create(req, res, next) {
  try {
    let { title, description, isFeatured, isActive, sortOrder, productIds, altTexts } = req.body;

    if (!req.files || req.files.length === 0) {
      return response.badRequest(res, 'At least one image is required');
    }

    productIds = parseMaybeJson(productIds, []);
    altTexts = parseMaybeJson(altTexts, []);

    const filesData = req.files.map((file, idx) => ({
      imageUrl: `/uploads/gallery/${file.filename}`,
      altText: altTexts[idx] || null,
      sortOrder: idx,
    }));

    const galleryImage = await prisma.galleryImage.create({
      data: {
        title,
        description: description || null,
        isFeatured: isFeatured === 'true' || isFeatured === true,
        isActive: isActive !== 'false' && isActive !== false,
        sortOrder: parseInt(sortOrder, 10) || 0,
        files: { create: filesData },
        products: Array.isArray(productIds) && productIds.length > 0
          ? { create: productIds.map((productId) => ({ productId })) }
          : undefined,
      },
      include: galleryInclude,
    });

    response.created(res, galleryImage);
  } catch (error) {
    if (req.files) {
      for (const file of req.files) {
        await imageService.deleteImage(path.join(uploadDir(), 'gallery', file.filename)).catch(() => {});
      }
    }
    next(error);
  }
}

async function update(req, res, next) {
  try {
    const { id } = req.params;
    let { title, description, isFeatured, isActive, sortOrder, productIds, fileUpdates } = req.body;

    const existing = await prisma.galleryImage.findUnique({
      where: { id },
      include: { files: true, products: true },
    });

    if (!existing) {
      if (req.files) {
        for (const file of req.files) {
          await imageService.deleteImage(path.join(uploadDir(), 'gallery', file.filename)).catch(() => {});
        }
      }
      return response.notFound(res, 'Gallery post not found');
    }

    productIds = parseMaybeJson(productIds, undefined);
    fileUpdates = parseMaybeJson(fileUpdates, null);

    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description || null;
    if (isFeatured !== undefined) updateData.isFeatured = isFeatured === 'true' || isFeatured === true;
    if (isActive !== undefined) updateData.isActive = isActive !== 'false' && isActive !== false;
    if (sortOrder !== undefined) updateData.sortOrder = parseInt(sortOrder, 10) || 0;

    await prisma.galleryImage.update({ where: { id }, data: updateData });

    // Handle existing files (reorder / delete)
    // fileUpdates format: [{ id: 'existing-id', sortOrder: 0, altText: '...' }, ...]
    // Any existing file NOT in fileUpdates will be deleted
    if (Array.isArray(fileUpdates)) {
      const keptIds = new Set(fileUpdates.filter(f => f.id).map(f => f.id));
      // Delete removed files
      for (const existingFile of existing.files) {
        if (!keptIds.has(existingFile.id)) {
          await imageService.deleteImage(
            path.join(uploadDir(), existingFile.imageUrl.replace('/uploads/', ''))
          ).catch(() => {});
          await prisma.galleryImageFile.delete({ where: { id: existingFile.id } });
        }
      }
      // Update remaining files
      for (const fu of fileUpdates) {
        if (fu.id) {
          await prisma.galleryImageFile.update({
            where: { id: fu.id },
            data: {
              sortOrder: parseInt(fu.sortOrder, 10) || 0,
              altText: fu.altText || null,
            },
          });
        }
      }
    }

    // Handle new file uploads
    if (req.files && req.files.length > 0) {
      const startingOrder = Array.isArray(fileUpdates) ? fileUpdates.length : existing.files.length;
      for (let i = 0; i < req.files.length; i++) {
        const file = req.files[i];
        await prisma.galleryImageFile.create({
          data: {
            galleryImageId: id,
            imageUrl: `/uploads/gallery/${file.filename}`,
            altText: null,
            sortOrder: startingOrder + i,
          },
        });
      }
    }

    // Update product associations
    if (Array.isArray(productIds)) {
      await prisma.galleryImageProduct.deleteMany({ where: { galleryImageId: id } });
      if (productIds.length > 0) {
        await prisma.galleryImageProduct.createMany({
          data: productIds.map((productId) => ({ galleryImageId: id, productId })),
        });
      }
    }

    const updated = await prisma.galleryImage.findUnique({ where: { id }, include: galleryInclude });
    response.success(res, updated);
  } catch (error) { next(error); }
}

async function remove(req, res, next) {
  try {
    const { id } = req.params;
    const existing = await prisma.galleryImage.findUnique({
      where: { id },
      include: { files: true },
    });

    if (!existing) return response.notFound(res, 'Gallery post not found');

    // Delete all image files from disk
    for (const file of existing.files) {
      await imageService.deleteImage(
        path.join(uploadDir(), file.imageUrl.replace('/uploads/', ''))
      ).catch(() => {});
    }

    // Delete post (cascades to files + products)
    await prisma.galleryImage.delete({ where: { id } });
    response.noContent(res);
  } catch (error) { next(error); }
}

async function updateOrder(req, res, next) {
  try {
    const { items } = req.body;
    if (!Array.isArray(items)) return response.badRequest(res, 'Items array is required');

    await Promise.all(
      items.map((item) =>
        prisma.galleryImage.update({
          where: { id: item.id },
          data: { sortOrder: item.sortOrder },
        })
      )
    );

    response.success(res, { message: 'Sort order updated successfully' });
  } catch (error) { next(error); }
}

async function linkProducts(req, res, next) {
  try {
    const { id } = req.params;
    const { productIds } = req.body;

    const existing = await prisma.galleryImage.findUnique({ where: { id } });
    if (!existing) return response.notFound(res, 'Gallery post not found');
    if (!Array.isArray(productIds)) return response.badRequest(res, 'productIds array is required');

    await prisma.galleryImageProduct.deleteMany({ where: { galleryImageId: id } });
    if (productIds.length > 0) {
      await prisma.galleryImageProduct.createMany({
        data: productIds.map((productId) => ({ galleryImageId: id, productId })),
        skipDuplicates: true,
      });
    }

    const galleryImage = await prisma.galleryImage.findUnique({ where: { id }, include: galleryInclude });
    response.success(res, galleryImage);
  } catch (error) { next(error); }
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
