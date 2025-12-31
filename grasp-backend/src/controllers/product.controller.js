const { prisma } = require('../config');
const { response, generateSlug, generateUniqueSlug, parsePagination, buildPaginationMeta, parseSort } = require('../utils');
const { imageService } = require('../services');
const path = require('path');

// Common include for product queries
const productInclude = {
  category: true,
  variants: {
    orderBy: { sortOrder: 'asc' },
  },
  images: {
    orderBy: [{ isPrimary: 'desc' }, { sortOrder: 'asc' }],
  },
  documents: true,
  features: {
    orderBy: { sortOrder: 'asc' },
  },
  dynamicSpecs: {
    orderBy: { sortOrder: 'asc' },
  },
};

/**
 * Get all products with filtering and pagination (public)
 */
async function getAll(req, res, next) {
  try {
    const { page, limit, skip } = parsePagination(req.query);
    const orderBy = parseSort(req.query, ['name', 'createdAt', 'updatedAt'], 'createdAt');

    // Build where clause
    const where = { isActive: true };

    if (req.query.category) {
      where.category = { slug: req.query.category };
    }
    if (req.query.material) {
      where.specMaterial = { contains: req.query.material, mode: 'insensitive' };
    }
    if (req.query.ipRating) {
      where.specIpRating = { contains: req.query.ipRating, mode: 'insensitive' };
    }
    if (req.query.isFeatured === 'true') {
      where.isFeatured = true;
    }
    if (req.query.search) {
      where.OR = [
        { name: { contains: req.query.search, mode: 'insensitive' } },
        { code: { contains: req.query.search, mode: 'insensitive' } },
        { description: { contains: req.query.search, mode: 'insensitive' } },
      ];
    }
    if (req.query.inStock === 'true') {
      where.variants = {
        some: { stockQuantity: { gt: 0 }, isActive: true },
      };
    }

    // Get products and count
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: productInclude,
        orderBy,
        skip,
        take: limit,
      }),
      prisma.product.count({ where }),
    ]);

    response.success(res, products, buildPaginationMeta(total, page, limit));
  } catch (error) {
    next(error);
  }
}

/**
 * Get featured products (public)
 */
async function getFeatured(req, res, next) {
  try {
    const limit = parseInt(req.query.limit, 10) || 6;

    const products = await prisma.product.findMany({
      where: { isFeatured: true, isActive: true },
      include: productInclude,
      take: limit,
      orderBy: { updatedAt: 'desc' },
    });

    response.success(res, products);
  } catch (error) {
    next(error);
  }
}

/**
 * Search products (public)
 */
async function search(req, res, next) {
  try {
    const { q } = req.query;
    const { page, limit, skip } = parsePagination(req.query);

    if (!q || q.trim().length < 2) {
      return response.success(res, [], buildPaginationMeta(0, page, limit));
    }

    const where = {
      isActive: true,
      OR: [
        { name: { contains: q, mode: 'insensitive' } },
        { code: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
        { category: { name: { contains: q, mode: 'insensitive' } } },
      ],
    };

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: productInclude,
        skip,
        take: limit,
        orderBy: { name: 'asc' },
      }),
      prisma.product.count({ where }),
    ]);

    response.success(res, products, buildPaginationMeta(total, page, limit));
  } catch (error) {
    next(error);
  }
}

/**
 * Get product by slug (public)
 */
async function getBySlug(req, res, next) {
  try {
    const { slug } = req.params;

    const product = await prisma.product.findUnique({
      where: { slug },
      include: productInclude,
    });

    if (!product) {
      return response.notFound(res, 'Product not found');
    }

    response.success(res, product);
  } catch (error) {
    next(error);
  }
}

/**
 * Get products by category (public)
 */
async function getByCategory(req, res, next) {
  try {
    const { slug } = req.params;
    const { page, limit, skip } = parsePagination(req.query);

    // Check if category exists
    const category = await prisma.category.findUnique({
      where: { slug },
    });

    if (!category) {
      return response.notFound(res, 'Category not found');
    }

    const where = { categoryId: category.id, isActive: true };

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: productInclude,
        skip,
        take: limit,
        orderBy: { name: 'asc' },
      }),
      prisma.product.count({ where }),
    ]);

    response.success(res, { category, products }, buildPaginationMeta(total, page, limit));
  } catch (error) {
    next(error);
  }
}

/**
 * Create a new product (admin)
 */
async function create(req, res, next) {
  try {
    const {
      categoryId,
      name,
      slug: customSlug,
      code,
      description,
      fullDescription,
      specMaterial,
      specIpRating,
      specFlammability,
      specColor,
      specDoorType,
      specMounting,
      specTemperatureRange,
      isFeatured,
      isActive,
      features,
      dynamicSpecs,
    } = req.body;

    // Check if category exists
    const category = await prisma.category.findUnique({
      where: { id: categoryId },
    });

    if (!category) {
      return response.badRequest(res, 'Category not found');
    }

    // Generate slug
    let slug = customSlug || generateSlug(name);
    slug = await generateUniqueSlug(slug, async (s) => {
      const existing = await prisma.product.findUnique({ where: { slug: s } });
      return !!existing;
    });

    // Create product
    const product = await prisma.product.create({
      data: {
        categoryId,
        name,
        slug,
        code,
        description,
        fullDescription,
        specMaterial,
        specIpRating,
        specFlammability,
        specColor,
        specDoorType,
        specMounting,
        specTemperatureRange,
        isFeatured,
        isActive,
        features: features
          ? {
              create: features.map((text, index) => ({
                featureText: text,
                sortOrder: index,
              })),
            }
          : undefined,
        dynamicSpecs: dynamicSpecs
          ? {
              create: dynamicSpecs.map((spec, index) => ({
                specKey: spec.key,
                specValue: spec.value,
                sortOrder: index,
              })),
            }
          : undefined,
      },
      include: productInclude,
    });

    response.created(res, product);
  } catch (error) {
    next(error);
  }
}

/**
 * Update a product (admin)
 */
async function update(req, res, next) {
  try {
    const { id } = req.params;
    const {
      categoryId,
      name,
      slug: customSlug,
      code,
      description,
      fullDescription,
      specMaterial,
      specIpRating,
      specFlammability,
      specColor,
      specDoorType,
      specMounting,
      specTemperatureRange,
      isFeatured,
      isActive,
      features,
      dynamicSpecs,
    } = req.body;

    // Check if product exists
    const existing = await prisma.product.findUnique({
      where: { id },
    });

    if (!existing) {
      return response.notFound(res, 'Product not found');
    }

    // Check category if changing
    if (categoryId) {
      const category = await prisma.category.findUnique({
        where: { id: categoryId },
      });
      if (!category) {
        return response.badRequest(res, 'Category not found');
      }
    }

    // Handle slug
    let slug = customSlug;
    if (slug && slug !== existing.slug) {
      slug = await generateUniqueSlug(slug, async (s) => {
        const found = await prisma.product.findUnique({ where: { slug: s } });
        return found && found.id !== id;
      });
    }

    // Build update data
    const updateData = {};
    if (categoryId) updateData.categoryId = categoryId;
    if (name) updateData.name = name;
    if (slug) updateData.slug = slug;
    if (code !== undefined) updateData.code = code;
    if (description !== undefined) updateData.description = description;
    if (fullDescription !== undefined) updateData.fullDescription = fullDescription;
    if (specMaterial !== undefined) updateData.specMaterial = specMaterial;
    if (specIpRating !== undefined) updateData.specIpRating = specIpRating;
    if (specFlammability !== undefined) updateData.specFlammability = specFlammability;
    if (specColor !== undefined) updateData.specColor = specColor;
    if (specDoorType !== undefined) updateData.specDoorType = specDoorType;
    if (specMounting !== undefined) updateData.specMounting = specMounting;
    if (specTemperatureRange !== undefined) updateData.specTemperatureRange = specTemperatureRange;
    if (typeof isFeatured === 'boolean') updateData.isFeatured = isFeatured;
    if (typeof isActive === 'boolean') updateData.isActive = isActive;

    // Update product
    let product = await prisma.product.update({
      where: { id },
      data: updateData,
      include: productInclude,
    });

    // Update features if provided
    if (features !== undefined) {
      await prisma.productFeature.deleteMany({ where: { productId: id } });
      if (features.length > 0) {
        await prisma.productFeature.createMany({
          data: features.map((text, index) => ({
            productId: id,
            featureText: text,
            sortOrder: index,
          })),
        });
      }
    }

    // Update dynamic specs if provided
    if (dynamicSpecs !== undefined) {
      await prisma.productDynamicSpec.deleteMany({ where: { productId: id } });
      if (dynamicSpecs.length > 0) {
        await prisma.productDynamicSpec.createMany({
          data: dynamicSpecs.map((spec, index) => ({
            productId: id,
            specKey: spec.key,
            specValue: spec.value,
            sortOrder: index,
          })),
        });
      }
    }

    // Refetch if features or specs were updated
    if (features !== undefined || dynamicSpecs !== undefined) {
      product = await prisma.product.findUnique({
        where: { id },
        include: productInclude,
      });
    }

    response.success(res, product);
  } catch (error) {
    next(error);
  }
}

/**
 * Delete a product (admin)
 */
async function remove(req, res, next) {
  try {
    const { id } = req.params;

    // Check if product exists
    const existing = await prisma.product.findUnique({
      where: { id },
      include: { images: true, documents: true },
    });

    if (!existing) {
      return response.notFound(res, 'Product not found');
    }

    // Delete all associated files
    const uploadDir = process.env.UPLOAD_DIR || './uploads';
    for (const image of existing.images) {
      await imageService.deleteImage(path.join(uploadDir, image.imageUrl)).catch(() => {});
    }
    for (const doc of existing.documents) {
      await imageService.deleteFile(path.join(uploadDir, doc.documentUrl)).catch(() => {});
    }

    // Delete product (cascades to variants, images, etc.)
    await prisma.product.delete({
      where: { id },
    });

    response.noContent(res);
  } catch (error) {
    next(error);
  }
}

// ==================== VARIANTS ====================

/**
 * Add a variant to a product
 */
async function addVariant(req, res, next) {
  try {
    const { id } = req.params;
    const data = req.body;

    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      return response.notFound(res, 'Product not found');
    }

    // Create variant
    const variant = await prisma.productVariant.create({
      data: {
        productId: id,
        ...data,
      },
    });

    response.created(res, variant);
  } catch (error) {
    next(error);
  }
}

/**
 * Update a variant
 */
async function updateVariant(req, res, next) {
  try {
    const { id, variantId } = req.params;
    const data = req.body;

    // Check if variant exists
    const existing = await prisma.productVariant.findFirst({
      where: { id: variantId, productId: id },
    });

    if (!existing) {
      return response.notFound(res, 'Variant not found');
    }

    // Update variant
    const variant = await prisma.productVariant.update({
      where: { id: variantId },
      data,
    });

    response.success(res, variant);
  } catch (error) {
    next(error);
  }
}

/**
 * Delete a variant
 */
async function removeVariant(req, res, next) {
  try {
    const { id, variantId } = req.params;

    // Check if variant exists
    const existing = await prisma.productVariant.findFirst({
      where: { id: variantId, productId: id },
    });

    if (!existing) {
      return response.notFound(res, 'Variant not found');
    }

    // Delete variant
    await prisma.productVariant.delete({
      where: { id: variantId },
    });

    response.noContent(res);
  } catch (error) {
    next(error);
  }
}

// ==================== IMAGES ====================

/**
 * Upload images to a product
 */
async function uploadImages(req, res, next) {
  try {
    const { id } = req.params;

    if (!req.files || req.files.length === 0) {
      return response.badRequest(res, 'No image files provided');
    }

    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      // Delete uploaded files
      for (const file of req.files) {
        await imageService.deleteFile(file.path);
      }
      return response.notFound(res, 'Product not found');
    }

    // Check if product has primary image
    const hasPrimary = await prisma.productImage.findFirst({
      where: { productId: id, isPrimary: true },
    });

    const uploadDir = process.env.UPLOAD_DIR || './uploads';
    const images = [];

    for (let i = 0; i < req.files.length; i++) {
      const file = req.files[i];

      // Process image
      await imageService.processImage(file.path);

      // Get relative path
      const relativePath = path.relative(uploadDir, file.path);

      // Create image record
      const image = await prisma.productImage.create({
        data: {
          productId: id,
          imageUrl: relativePath,
          isPrimary: !hasPrimary && i === 0, // First image is primary if none exists
          sortOrder: i,
        },
      });

      images.push(image);
    }

    response.created(res, images);
  } catch (error) {
    next(error);
  }
}

/**
 * Update an image
 */
async function updateImage(req, res, next) {
  try {
    const { id, imageId } = req.params;
    const { altText, isPrimary, sortOrder } = req.body;

    // Check if image exists
    const existing = await prisma.productImage.findFirst({
      where: { id: imageId, productId: id },
    });

    if (!existing) {
      return response.notFound(res, 'Image not found');
    }

    // If setting as primary, unset other primary images
    if (isPrimary === true) {
      await prisma.productImage.updateMany({
        where: { productId: id, isPrimary: true },
        data: { isPrimary: false },
      });
    }

    // Update image
    const image = await prisma.productImage.update({
      where: { id: imageId },
      data: {
        ...(altText !== undefined && { altText }),
        ...(typeof isPrimary === 'boolean' && { isPrimary }),
        ...(typeof sortOrder === 'number' && { sortOrder }),
      },
    });

    response.success(res, image);
  } catch (error) {
    next(error);
  }
}

/**
 * Delete an image
 */
async function removeImage(req, res, next) {
  try {
    const { id, imageId } = req.params;

    // Check if image exists
    const existing = await prisma.productImage.findFirst({
      where: { id: imageId, productId: id },
    });

    if (!existing) {
      return response.notFound(res, 'Image not found');
    }

    // Delete file
    const uploadDir = process.env.UPLOAD_DIR || './uploads';
    await imageService.deleteImage(path.join(uploadDir, existing.imageUrl)).catch(() => {});

    // Delete record
    await prisma.productImage.delete({
      where: { id: imageId },
    });

    response.noContent(res);
  } catch (error) {
    next(error);
  }
}

// ==================== DOCUMENTS ====================

/**
 * Upload a document to a product
 */
async function uploadDocument(req, res, next) {
  try {
    const { id } = req.params;
    const { name, documentType } = req.body;

    if (!req.file) {
      return response.badRequest(res, 'No document file provided');
    }

    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      await imageService.deleteFile(req.file.path);
      return response.notFound(res, 'Product not found');
    }

    const uploadDir = process.env.UPLOAD_DIR || './uploads';
    const relativePath = path.relative(uploadDir, req.file.path);

    // Create document record
    const document = await prisma.productDocument.create({
      data: {
        productId: id,
        name: name || req.file.originalname,
        documentUrl: relativePath,
        documentType: documentType || 'OTHER',
        fileSizeBytes: req.file.size,
      },
    });

    response.created(res, document);
  } catch (error) {
    next(error);
  }
}

/**
 * Delete a document
 */
async function removeDocument(req, res, next) {
  try {
    const { id, docId } = req.params;

    // Check if document exists
    const existing = await prisma.productDocument.findFirst({
      where: { id: docId, productId: id },
    });

    if (!existing) {
      return response.notFound(res, 'Document not found');
    }

    // Delete file
    const uploadDir = process.env.UPLOAD_DIR || './uploads';
    await imageService.deleteFile(path.join(uploadDir, existing.documentUrl)).catch(() => {});

    // Delete record
    await prisma.productDocument.delete({
      where: { id: docId },
    });

    response.noContent(res);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getAll,
  getFeatured,
  search,
  getBySlug,
  getByCategory,
  create,
  update,
  remove,
  addVariant,
  updateVariant,
  removeVariant,
  uploadImages,
  updateImage,
  removeImage,
  uploadDocument,
  removeDocument,
};
