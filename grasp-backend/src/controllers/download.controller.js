const { prisma } = require('../config');
const { response, generateSlug, generateUniqueSlug } = require('../utils');
const { imageService } = require('../services');
const path = require('path');
const fs = require('fs');

const uploadDir = process.env.UPLOAD_DIR || './uploads';

// ===== PUBLIC =====

/**
 * Get all downloads grouped by category (public).
 * Also includes product documents from active products as virtual categories.
 */
async function getAll(req, res, next) {
  try {
    // Regular download categories
    const categories = await prisma.downloadCategory.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
      include: {
        downloads: {
          where: { isActive: true },
          orderBy: { sortOrder: 'asc' },
        },
      },
    });

    // Product documents from active products
    const productDocs = await prisma.productDocument.findMany({
      where: { product: { isActive: true } },
      include: { product: { select: { name: true, slug: true } } },
      orderBy: { createdAt: 'asc' },
    });

    // Map documentType → virtual category config
    const docTypeConfig = {
      DATASHEET:   { name: 'Product Datasheets',  slug: 'product-datasheets',   icon: 'datasheet'   },
      MANUAL:      { name: 'Product Manuals',      slug: 'product-manuals',      icon: 'manual'      },
      CERTIFICATE: { name: 'Certificates',         slug: 'product-certificates', icon: 'certificate' },
      CAD:         { name: 'CAD Drawings',         slug: 'product-cad',          icon: 'catalog'     },
      OTHER:       { name: 'Product Documents',    slug: 'product-documents',    icon: 'catalog'     },
    };

    // Group product docs by documentType
    const grouped = {};
    productDocs.forEach(doc => {
      const type = doc.documentType || 'OTHER';
      if (!grouped[type]) grouped[type] = [];
      grouped[type].push({
        id:            doc.id,
        categoryId:    `product-${type.toLowerCase()}`,
        name:          doc.name,
        description:   doc.product?.name || null, // product name as subtitle
        documentUrl:   doc.documentUrl,
        fileSizeBytes: doc.fileSizeBytes,
        sortOrder:     0,
        isActive:      true,
        createdAt:     doc.createdAt,
        updatedAt:     doc.createdAt,
      });
    });

    // Build virtual categories (only for types that have at least one document)
    let sortCounter = 1000;
    const virtualCategories = Object.entries(grouped).map(([type, downloads]) => {
      const cfg = docTypeConfig[type] || docTypeConfig.OTHER;
      return {
        id:          `product-${type.toLowerCase()}`,
        name:        cfg.name,
        slug:        cfg.slug,
        description: null,
        icon:        cfg.icon,
        sortOrder:   sortCounter++,
        isActive:    true,
        downloads,
      };
    });

    response.success(res, [...categories, ...virtualCategories]);
  } catch (error) {
    next(error);
  }
}

// ===== ADMIN: CATEGORIES =====

/**
 * Get all categories for admin (includes inactive)
 */
async function adminGetCategories(req, res, next) {
  try {
    const categories = await prisma.downloadCategory.findMany({
      orderBy: { sortOrder: 'asc' },
      include: {
        _count: { select: { downloads: true } },
      },
    });

    response.success(res, categories);
  } catch (error) {
    next(error);
  }
}

/**
 * Create a download category (admin)
 */
async function createCategory(req, res, next) {
  try {
    const { name, description, icon, sortOrder, isActive } = req.body;

    const baseSlug = generateSlug(name);
    const slug = await generateUniqueSlug(baseSlug, async (s) => {
      const existing = await prisma.downloadCategory.findUnique({ where: { slug: s } });
      return !!existing;
    });

    const category = await prisma.downloadCategory.create({
      data: {
        name,
        slug,
        description: description || null,
        icon: icon || 'catalog',
        sortOrder: parseInt(sortOrder, 10) || 0,
        isActive: isActive !== false && isActive !== 'false',
      },
      include: {
        _count: { select: { downloads: true } },
      },
    });

    response.created(res, category);
  } catch (error) {
    next(error);
  }
}

/**
 * Update a download category (admin)
 */
async function updateCategory(req, res, next) {
  try {
    const { id } = req.params;
    const { name, description, icon, sortOrder, isActive } = req.body;

    const existing = await prisma.downloadCategory.findUnique({ where: { id } });
    if (!existing) {
      return response.notFound(res, 'Download category not found');
    }

    const updateData = {};
    if (name !== undefined) {
      updateData.name = name;
      if (name !== existing.name) {
        const baseSlug = generateSlug(name);
        updateData.slug = await generateUniqueSlug(baseSlug, async (s) => {
          const found = await prisma.downloadCategory.findUnique({ where: { slug: s } });
          return found && found.id !== id;
        });
      }
    }
    if (description !== undefined) updateData.description = description || null;
    if (icon !== undefined) updateData.icon = icon;
    if (sortOrder !== undefined) updateData.sortOrder = parseInt(sortOrder, 10) || 0;
    if (isActive !== undefined) updateData.isActive = isActive !== false && isActive !== 'false';

    const category = await prisma.downloadCategory.update({
      where: { id },
      data: updateData,
      include: {
        _count: { select: { downloads: true } },
      },
    });

    response.success(res, category);
  } catch (error) {
    next(error);
  }
}

/**
 * Delete a download category (admin) — cascades to downloads
 */
async function deleteCategory(req, res, next) {
  try {
    const { id } = req.params;

    const existing = await prisma.downloadCategory.findUnique({
      where: { id },
      include: { downloads: true },
    });

    if (!existing) {
      return response.notFound(res, 'Download category not found');
    }

    // Delete all associated files
    for (const download of existing.downloads) {
      const filePath = path.join(uploadDir, download.documentUrl.replace('/uploads/', ''));
      fs.unlink(filePath, () => {});
    }

    await prisma.downloadCategory.delete({ where: { id } });

    response.noContent(res);
  } catch (error) {
    next(error);
  }
}

// ===== ADMIN: DOWNLOADS =====

/**
 * Get all downloads for admin (includes inactive)
 */
async function adminGetAll(req, res, next) {
  try {
    const downloads = await prisma.download.findMany({
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
      include: {
        category: true,
      },
    });

    response.success(res, downloads);
  } catch (error) {
    next(error);
  }
}

/**
 * Get single download by ID (admin)
 */
async function getById(req, res, next) {
  try {
    const { id } = req.params;

    const download = await prisma.download.findUnique({
      where: { id },
      include: { category: true },
    });

    if (!download) {
      return response.notFound(res, 'Download not found');
    }

    response.success(res, download);
  } catch (error) {
    next(error);
  }
}

/**
 * Create a new download (admin)
 */
async function create(req, res, next) {
  try {
    const { name, description, categoryId, sortOrder, isActive } = req.body;

    if (!req.file) {
      return response.badRequest(res, 'PDF document is required');
    }

    // Verify category exists
    const category = await prisma.downloadCategory.findUnique({ where: { id: categoryId } });
    if (!category) {
      // Clean up uploaded file
      fs.unlink(req.file.path, () => {});
      return response.badRequest(res, 'Invalid category ID');
    }

    const download = await prisma.download.create({
      data: {
        name,
        description: description || null,
        categoryId,
        documentUrl: `/uploads/downloads/${req.file.filename}`,
        fileSizeBytes: req.file.size,
        sortOrder: parseInt(sortOrder, 10) || 0,
        isActive: isActive !== false && isActive !== 'false',
      },
      include: { category: true },
    });

    response.created(res, download);
  } catch (error) {
    // Clean up uploaded file on error
    if (req.file) {
      fs.unlink(req.file.path, () => {});
    }
    next(error);
  }
}

/**
 * Update a download (admin)
 */
async function update(req, res, next) {
  try {
    const { id } = req.params;
    const { name, description, categoryId, sortOrder, isActive } = req.body;

    const existing = await prisma.download.findUnique({ where: { id } });
    if (!existing) {
      if (req.file) fs.unlink(req.file.path, () => {});
      return response.notFound(res, 'Download not found');
    }

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description || null;
    if (categoryId !== undefined) {
      const category = await prisma.downloadCategory.findUnique({ where: { id: categoryId } });
      if (!category) {
        if (req.file) fs.unlink(req.file.path, () => {});
        return response.badRequest(res, 'Invalid category ID');
      }
      updateData.categoryId = categoryId;
    }
    if (sortOrder !== undefined) updateData.sortOrder = parseInt(sortOrder, 10) || 0;
    if (isActive !== undefined) updateData.isActive = isActive !== false && isActive !== 'false';

    // Handle new file upload
    if (req.file) {
      // Delete old file
      const oldPath = path.join(uploadDir, existing.documentUrl.replace('/uploads/', ''));
      fs.unlink(oldPath, () => {});

      updateData.documentUrl = `/uploads/downloads/${req.file.filename}`;
      updateData.fileSizeBytes = req.file.size;
    }

    const download = await prisma.download.update({
      where: { id },
      data: updateData,
      include: { category: true },
    });

    response.success(res, download);
  } catch (error) {
    if (req.file) fs.unlink(req.file.path, () => {});
    next(error);
  }
}

/**
 * Delete a download (admin)
 */
async function remove(req, res, next) {
  try {
    const { id } = req.params;

    const existing = await prisma.download.findUnique({ where: { id } });
    if (!existing) {
      return response.notFound(res, 'Download not found');
    }

    // Delete file
    const filePath = path.join(uploadDir, existing.documentUrl.replace('/uploads/', ''));
    fs.unlink(filePath, () => {});

    await prisma.download.delete({ where: { id } });

    response.noContent(res);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getAll,
  adminGetCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  adminGetAll,
  getById,
  create,
  update,
  remove,
};
