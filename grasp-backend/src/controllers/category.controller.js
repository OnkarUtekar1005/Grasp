const { prisma } = require('../config');
const { response, generateSlug, generateUniqueSlug } = require('../utils');
const { imageService } = require('../services');
const path = require('path');

/**
 * Get all categories (public)
 */
async function getAll(req, res, next) {
  try {
    const categories = await prisma.category.findMany({
      include: {
        specs: {
          orderBy: { sortOrder: 'asc' },
        },
        _count: {
          select: { products: true },
        },
      },
      orderBy: { sortOrder: 'asc' },
    });

    response.success(res, categories);
  } catch (error) {
    next(error);
  }
}

/**
 * Get category by slug (public)
 */
async function getBySlug(req, res, next) {
  try {
    const { slug } = req.params;

    const category = await prisma.category.findUnique({
      where: { slug },
      include: {
        specs: {
          orderBy: { sortOrder: 'asc' },
        },
        _count: {
          select: { products: true },
        },
      },
    });

    if (!category) {
      return response.notFound(res, 'Category not found');
    }

    response.success(res, category);
  } catch (error) {
    next(error);
  }
}

/**
 * Create a new category (admin)
 */
async function create(req, res, next) {
  try {
    const { name, slug: customSlug, code, description, isFeatured, sortOrder, specs } = req.body;

    // Generate or use custom slug
    let slug = customSlug || generateSlug(name);

    // Ensure unique slug
    slug = await generateUniqueSlug(slug, async (s) => {
      const existing = await prisma.category.findUnique({ where: { slug: s } });
      return !!existing;
    });

    // Create category with specs
    const category = await prisma.category.create({
      data: {
        name,
        slug,
        code,
        description,
        isFeatured,
        sortOrder,
        specs: specs
          ? {
              create: specs.map((specValue, index) => ({
                specValue,
                sortOrder: index,
              })),
            }
          : undefined,
      },
      include: {
        specs: true,
      },
    });

    response.created(res, category);
  } catch (error) {
    next(error);
  }
}

/**
 * Update a category (admin)
 */
async function update(req, res, next) {
  try {
    const { id } = req.params;
    const { name, slug: customSlug, code, description, isFeatured, sortOrder, specs } = req.body;

    // Check if category exists
    const existing = await prisma.category.findUnique({
      where: { id },
    });

    if (!existing) {
      return response.notFound(res, 'Category not found');
    }

    // Handle slug update
    let slug = customSlug;
    if (slug && slug !== existing.slug) {
      slug = await generateUniqueSlug(slug, async (s) => {
        const found = await prisma.category.findUnique({ where: { slug: s } });
        return found && found.id !== id;
      });
    }

    // Update category
    const category = await prisma.category.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(slug && { slug }),
        ...(code !== undefined && { code }),
        ...(description !== undefined && { description }),
        ...(typeof isFeatured === 'boolean' && { isFeatured }),
        ...(typeof sortOrder === 'number' && { sortOrder }),
      },
      include: {
        specs: true,
      },
    });

    // Update specs if provided
    if (specs !== undefined) {
      // Delete existing specs
      await prisma.categorySpec.deleteMany({
        where: { categoryId: id },
      });

      // Create new specs
      if (specs.length > 0) {
        await prisma.categorySpec.createMany({
          data: specs.map((specValue, index) => ({
            categoryId: id,
            specValue,
            sortOrder: index,
          })),
        });
      }

      // Fetch updated category with new specs
      const updated = await prisma.category.findUnique({
        where: { id },
        include: { specs: true },
      });

      return response.success(res, updated);
    }

    response.success(res, category);
  } catch (error) {
    next(error);
  }
}

/**
 * Delete a category (admin)
 */
async function remove(req, res, next) {
  try {
    const { id } = req.params;

    // Check if category exists
    const existing = await prisma.category.findUnique({
      where: { id },
      include: { _count: { select: { products: true } } },
    });

    if (!existing) {
      return response.notFound(res, 'Category not found');
    }

    // Check if category has products
    if (existing._count.products > 0) {
      return response.badRequest(
        res,
        `Cannot delete category with ${existing._count.products} product(s). Move or delete products first.`
      );
    }

    // Delete category image if exists
    if (existing.imageUrl) {
      const imagePath = path.join(process.env.UPLOAD_DIR || './uploads', existing.imageUrl);
      await imageService.deleteImage(imagePath).catch(() => {});
    }

    // Delete category
    await prisma.category.delete({
      where: { id },
    });

    response.noContent(res);
  } catch (error) {
    next(error);
  }
}

/**
 * Upload category image (admin)
 */
async function uploadImage(req, res, next) {
  try {
    const { id } = req.params;

    if (!req.file) {
      return response.badRequest(res, 'No image file provided');
    }

    // Check if category exists
    const existing = await prisma.category.findUnique({
      where: { id },
    });

    if (!existing) {
      // Delete uploaded file
      await imageService.deleteFile(req.file.path);
      return response.notFound(res, 'Category not found');
    }

    // Delete old image if exists
    if (existing.imageUrl) {
      const oldPath = path.join(process.env.UPLOAD_DIR || './uploads', existing.imageUrl);
      await imageService.deleteImage(oldPath).catch(() => {});
    }

    // Process new image
    await imageService.processImage(req.file.path);

    // Get relative path for storage
    const relativePath = path.relative(process.env.UPLOAD_DIR || './uploads', req.file.path);

    // Update category
    const category = await prisma.category.update({
      where: { id },
      data: { imageUrl: relativePath },
      include: { specs: true },
    });

    response.success(res, category);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getAll,
  getBySlug,
  create,
  update,
  remove,
  uploadImage,
};
