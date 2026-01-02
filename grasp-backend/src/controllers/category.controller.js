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
          select: {
            products: true,           // Deprecated: old direct relation
            productCategories: true,  // New: junction table count
          },
        },
      },
      orderBy: { sortOrder: 'asc' },
    });

    // Map to provide consistent productCount using junction table
    const mappedCategories = categories.map(cat => ({
      ...cat,
      productCount: cat._count.productCategories || cat._count.products || 0,
    }));

    response.success(res, mappedCategories);
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
          select: {
            products: true,           // Deprecated
            productCategories: true,  // New: junction table
          },
        },
      },
    });

    if (!category) {
      return response.notFound(res, 'Category not found');
    }

    // Add consistent productCount
    const result = {
      ...category,
      productCount: category._count.productCategories || category._count.products || 0,
    };

    response.success(res, result);
  } catch (error) {
    next(error);
  }
}

/**
 * Create a new category (admin)
 */
async function create(req, res, next) {
  try {
    let { name, slug: customSlug, code, description, isFeatured, sortOrder, specs } = req.body;

    // Parse specs if it's a JSON string (from FormData)
    if (typeof specs === 'string') {
      try {
        specs = JSON.parse(specs);
      } catch {
        specs = [];
      }
    }

    // Generate or use custom slug
    let slug = customSlug || generateSlug(name);

    // Ensure unique slug
    slug = await generateUniqueSlug(slug, async (s) => {
      const existing = await prisma.category.findUnique({ where: { slug: s } });
      return !!existing;
    });

    // Handle image upload
    let imageUrl = null;
    if (req.file) {
      imageUrl = `/uploads/categories/${req.file.filename}`;
    }

    // Create category with specs
    const category = await prisma.category.create({
      data: {
        name,
        slug,
        code,
        description,
        isFeatured: isFeatured === 'true' || isFeatured === true,
        sortOrder: sortOrder ? parseInt(sortOrder, 10) : 0,
        imageUrl,
        specs: Array.isArray(specs) && specs.length > 0
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
    console.log('========== CATEGORY UPDATE ==========');
    console.log('Category ID:', id);
    console.log('Request body:', JSON.stringify(req.body, null, 2));
    console.log('Request file:', req.file);

    const { name, slug: customSlug, code, description, isFeatured, sortOrder, specs, existingImage } = req.body;
    console.log('existingImage value:', existingImage, '| type:', typeof existingImage, '| length:', existingImage?.length);

    // Check if category exists
    const existing = await prisma.category.findUnique({
      where: { id },
    });

    if (!existing) {
      return response.notFound(res, 'Category not found');
    }

    // Parse specs if it's a JSON string (from FormData)
    let parsedSpecs;
    if (typeof specs === 'string') {
      try {
        parsedSpecs = JSON.parse(specs);
      } catch {
        parsedSpecs = undefined;
      }
    } else {
      parsedSpecs = specs;
    }

    // Handle slug update
    let slug = customSlug;
    if (slug && slug !== existing.slug) {
      slug = await generateUniqueSlug(slug, async (s) => {
        const found = await prisma.category.findUnique({ where: { slug: s } });
        return found && found.id !== id;
      });
    }

    // Determine what to do with the image
    // Logic similar to ProductForm: compare existingImage sent vs what's in DB
    let newImageUrl;
    const uploadDir = process.env.UPLOAD_DIR || './uploads';

    console.log('=== IMAGE LOGIC ===');
    console.log('req.file:', !!req.file);
    console.log('existingImage:', existingImage);
    console.log('existing.imageUrl (in DB):', existing.imageUrl);

    if (req.file) {
      // Case 1: New image uploaded - delete old if exists, use new
      console.log('CASE 1: New file uploaded');
      if (existing.imageUrl) {
        const oldImagePath = path.join(uploadDir, existing.imageUrl.replace('/uploads/', ''));
        await imageService.deleteFile(oldImagePath).catch(() => {});
      }
      newImageUrl = `/uploads/categories/${req.file.filename}`;
    } else if (existingImage) {
      // Case 2: Keep the existing image as-is
      console.log('CASE 2: Keep existing image');
      newImageUrl = existingImage;
    } else if (existing.imageUrl) {
      // Case 3: existingImage is empty but category had an image = user removed it
      console.log('CASE 3: Image was removed - deleting from DB');
      const oldImagePath = path.join(uploadDir, existing.imageUrl.replace('/uploads/', ''));
      await imageService.deleteFile(oldImagePath).catch(() => {});
      newImageUrl = null;
    } else {
      console.log('CASE 4: No image before, none now');
    }
    console.log('newImageUrl to save:', newImageUrl);

    // Parse boolean and number from FormData strings
    const parsedIsFeatured = isFeatured === 'true' ? true : isFeatured === 'false' ? false : undefined;
    const parsedSortOrder = sortOrder ? parseInt(sortOrder, 10) : undefined;

    // Build update data - only include fields that should be updated
    const updateData = {};
    if (name) updateData.name = name;
    if (slug) updateData.slug = slug;
    if (code !== undefined) updateData.code = code;
    if (description !== undefined) updateData.description = description;
    if (parsedIsFeatured !== undefined) updateData.isFeatured = parsedIsFeatured;
    if (parsedSortOrder !== undefined) updateData.sortOrder = parsedSortOrder;
    if (newImageUrl !== undefined) updateData.imageUrl = newImageUrl;

    console.log('=== PRISMA UPDATE ===');
    console.log('updateData:', JSON.stringify(updateData, null, 2));

    // Update category
    const category = await prisma.category.update({
      where: { id },
      data: updateData,
      include: {
        specs: true,
      },
    });
    console.log('Updated category imageUrl:', category.imageUrl);
    console.log('========== UPDATE COMPLETE ==========');

    // Update specs if provided
    if (Array.isArray(parsedSpecs)) {
      // Delete existing specs
      await prisma.categorySpec.deleteMany({
        where: { categoryId: id },
      });

      // Create new specs
      if (parsedSpecs.length > 0) {
        await prisma.categorySpec.createMany({
          data: parsedSpecs.map((specValue, index) => ({
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
 * Products referencing this category will have their categoryId set to null
 * Junction table entries will be cascade deleted automatically
 */
async function remove(req, res, next) {
  try {
    const { id } = req.params;
    console.log('=== DELETE CATEGORY ===');
    console.log('Category ID:', id);

    // Check if category exists
    const existing = await prisma.category.findUnique({
      where: { id },
    });

    if (!existing) {
      console.log('Category not found');
      return response.notFound(res, 'Category not found');
    }

    // Count products affected (via junction table)
    const junctionCount = await prisma.productCategory.count({
      where: { categoryId: id },
    });
    // Also count old direct relation
    const directCount = await prisma.product.count({
      where: { categoryId: id },
    });
    console.log('Products in junction table:', junctionCount);
    console.log('Products with direct categoryId:', directCount);

    // Step 1: Update all products to remove direct category reference (backward compat)
    console.log('Step 1: Removing direct category reference from products...');
    const updateResult = await prisma.product.updateMany({
      where: { categoryId: id },
      data: { categoryId: null },
    });
    console.log('Products updated:', updateResult.count);

    // Step 2: Delete all category specs
    console.log('Step 2: Deleting category specs...');
    const specsResult = await prisma.categorySpec.deleteMany({
      where: { categoryId: id },
    });
    console.log('Specs deleted:', specsResult.count);

    // Note: ProductCategory entries will be cascade deleted when category is deleted

    // Step 3: Delete the category (cascades to ProductCategory)
    console.log('Step 3: Deleting category...');
    await prisma.category.delete({
      where: { id },
    });
    console.log('Category deleted successfully');

    // Step 4: Delete category image if exists
    if (existing.imageUrl) {
      const uploadDir = process.env.UPLOAD_DIR || './uploads';
      const imagePath = path.join(uploadDir, existing.imageUrl.replace('/uploads/', ''));
      console.log('Step 4: Deleting image:', imagePath);
      await imageService.deleteFile(imagePath).catch((err) => {
        console.log('Image delete error (non-fatal):', err.message);
      });
    }

    console.log('=== DELETE COMPLETE ===');
    response.success(res, {
      message: 'Category deleted successfully',
      productsAffected: junctionCount || directCount
    });
  } catch (error) {
    console.error('Delete category error:', error);
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    console.error('Error meta:', error.meta);
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
      const oldPath = path.join(process.env.UPLOAD_DIR || './uploads', existing.imageUrl.replace('/uploads/', ''));
      await imageService.deleteFile(oldPath).catch(() => {});
    }

    // Store path consistently with create/update functions
    const imageUrl = `/uploads/categories/${req.file.filename}`;

    // Update category
    const category = await prisma.category.update({
      where: { id },
      data: { imageUrl },
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
