const { prisma } = require('../config');
const { response, generateSlug, generateUniqueSlug, parsePagination, buildPaginationMeta, parseSort } = require('../utils');
const { imageService } = require('../services');
const path = require('path');

// Helper to resolve document file path from stored URL
function resolveDocPath(docUrl) {
  const uploadDir = process.env.UPLOAD_DIR || './uploads';
  // Strip leading /uploads/ prefix if present to avoid double-nesting
  const cleaned = docUrl.replace(/^\/?uploads\//, '');
  return path.join(uploadDir, cleaned);
}

// Common include for product queries
const productInclude = {
  category: true, // Deprecated: kept for backward compatibility
  categories: {
    include: {
      category: {
        include: {
          specs: { orderBy: { sortOrder: 'asc' } },
        },
      },
    },
  },
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
    const orderBy = req.query.sort ? parseSort(req.query, ['name', 'createdAt', 'updatedAt'], 'createdAt') : { code: 'asc' };

    // Build where clause
    const where = { isActive: true };

    // Filter by category (supports both old single category and new multi-category)
    if (req.query.category) {
      where.categories = {
        some: {
          category: { slug: req.query.category },
        },
      };
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
    // Filter by dimensions (min/max range)
    if (req.query.minLength) where.dimensionLength = { ...where.dimensionLength, gte: parseFloat(req.query.minLength) };
    if (req.query.maxLength) where.dimensionLength = { ...where.dimensionLength, lte: parseFloat(req.query.maxLength) };
    if (req.query.minWidth) where.dimensionWidth = { ...where.dimensionWidth, gte: parseFloat(req.query.minWidth) };
    if (req.query.maxWidth) where.dimensionWidth = { ...where.dimensionWidth, lte: parseFloat(req.query.maxWidth) };
    if (req.query.minHeight) where.dimensionHeight = { ...where.dimensionHeight, gte: parseFloat(req.query.minHeight) };
    if (req.query.maxHeight) where.dimensionHeight = { ...where.dimensionHeight, lte: parseFloat(req.query.maxHeight) };
    // Filter by tags (supports comma-separated values for multi-select)
    if (req.query.tags) {
      const tagArray = req.query.tags.split(',').map(t => t.trim()).filter(Boolean);
      if (tagArray.length > 0) {
        where.tags = { hasSome: tagArray };
      }
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
        { categories: { some: { category: { name: { contains: q, mode: 'insensitive' } } } } },
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

    // Check if category exists (include specs)
    const category = await prisma.category.findUnique({
      where: { slug },
      include: {
        specs: { orderBy: { sortOrder: 'asc' } },
      },
    });

    if (!category) {
      return response.notFound(res, 'Category not found');
    }

    // Query using the junction table
    const where = {
      isActive: true,
      categories: {
        some: {
          categoryId: category.id,
        },
      },
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
    console.log('=== Product Create ===');
    console.log('Body:', req.body);
    console.log('Files:', req.files);

    let { name, description, category, categories, code, dimensionLength, dimensionWidth, dimensionHeight, tags, price, priceType, inStock, featured, specs, features } = req.body;

    // Parse specs/features if they're JSON strings
    if (typeof specs === 'string') {
      try {
        specs = JSON.parse(specs);
      } catch (e) {
        console.warn('Failed to parse specs JSON:', e.message);
        specs = [];
      }
    }
    if (typeof features === 'string') {
      try {
        features = JSON.parse(features);
      } catch (e) {
        console.warn('Failed to parse features JSON:', e.message);
        features = [];
      }
    }
    // Parse categories if it's a JSON string
    if (typeof categories === 'string') {
      try {
        categories = JSON.parse(categories);
      } catch (e) {
        console.warn('Failed to parse categories JSON:', e.message);
        categories = [];
      }
    }
    // Parse tags if it's a JSON string
    if (typeof tags === 'string') {
      try {
        tags = JSON.parse(tags);
      } catch (e) {
        console.warn('Failed to parse tags JSON:', e.message);
        tags = [];
      }
    }
    if (!Array.isArray(tags)) {
      tags = [];
    }

    // Handle both old single category and new multi-category format
    let categoryRecords = [];

    if (categories && Array.isArray(categories) && categories.length > 0) {
      // New format: array of category slugs
      categoryRecords = await prisma.category.findMany({
        where: { slug: { in: categories } },
      });
      if (categoryRecords.length === 0) {
        return response.badRequest(res, 'No valid categories found');
      }
    } else if (category) {
      // Old format: single category slug (backward compatibility)
      const categoryRecord = await prisma.category.findUnique({
        where: { slug: category },
      });
      if (!categoryRecord) {
        return response.badRequest(res, 'Category not found');
      }
      categoryRecords = [categoryRecord];
    } else {
      return response.badRequest(res, 'At least one category is required');
    }

    // Generate slug
    let slug = generateSlug(name);
    slug = await generateUniqueSlug(slug, async (s) => {
      const existing = await prisma.product.findUnique({ where: { slug: s } });
      return !!existing;
    });

    // Create product with categories via junction table
    const product = await prisma.product.create({
      data: {
        categoryId: categoryRecords[0]?.id || null, // Keep for backward compatibility (primary category)
        name,
        slug,
        code: code || null,
        dimensionLength: dimensionLength ? parseFloat(dimensionLength) : null,
        dimensionWidth: dimensionWidth ? parseFloat(dimensionWidth) : null,
        dimensionHeight: dimensionHeight ? parseFloat(dimensionHeight) : null,
        tags: tags.filter(t => t && t.trim()), // Filter out empty tags
        description: description || null,
        isFeatured: featured === 'true' || featured === true,
        isActive: true,
        // Create category associations via junction table
        categories: {
          create: categoryRecords.map((cat) => ({
            categoryId: cat.id,
          })),
        },
        // Store specs as dynamicSpecs (supports key-value objects and plain strings)
        dynamicSpecs: Array.isArray(specs) && specs.length > 0
          ? {
              create: specs.map((spec, index) => {
                // Support new format: {key, value} objects
                if (typeof spec === 'object' && spec.key && spec.value) {
                  return {
                    specKey: spec.key.trim(),
                    specValue: spec.value.trim(),
                    sortOrder: index,
                  };
                }
                // Backward compatibility: plain string values
                return {
                  specKey: `spec_${index}`,
                  specValue: String(spec),
                  sortOrder: index,
                };
              }),
            }
          : undefined,
        // Store features
        features: Array.isArray(features) && features.length > 0
          ? {
              create: features.map((featureText, index) => ({
                featureText,
                sortOrder: index,
              })),
            }
          : undefined,
      },
      include: productInclude,
    });

    // Handle image uploads (req.files is an object when using .fields())
    const imageFiles = req.files?.images || [];
    if (imageFiles.length > 0) {
      const imageData = imageFiles.map((file, index) => ({
        productId: product.id,
        imageUrl: `/uploads/products/images/${file.filename}`,
        isPrimary: index === 0,
        sortOrder: index,
      }));
      await prisma.productImage.createMany({ data: imageData });
    }

    // Handle document uploads
    const docFiles = req.files?.documents || [];
    if (docFiles.length > 0) {
      for (let i = 0; i < docFiles.length; i++) {
        const file = docFiles[i];
        // Parse document metadata
        let docMeta = { name: file.originalname.replace(/\.[^/.]+$/, ''), documentType: 'OTHER' };
        try {
          const metaKey = `documentMeta[${i}]`;
          if (req.body[metaKey]) {
            docMeta = JSON.parse(req.body[metaKey]);
          }
        } catch (e) {
          console.warn('Failed to parse document meta:', e.message);
        }

        await prisma.productDocument.create({
          data: {
            productId: product.id,
            name: docMeta.name || file.originalname,
            documentUrl: `/uploads/products/documents/${file.filename}`,
            documentType: docMeta.documentType || 'OTHER',
            fileSizeBytes: file.size,
          },
        });
      }
    }

    // Fetch product with all relations
    const fullProduct = await prisma.product.findUnique({
      where: { id: product.id },
      include: productInclude,
    });

    console.log('Product created:', fullProduct.id);
    response.created(res, fullProduct);
  } catch (error) {
    console.error('Product create error:', error);
    next(error);
  }
}

/**
 * Update a product (admin)
 */
async function update(req, res, next) {
  try {
    const { id } = req.params;
    console.log('=== Product Update ===');
    console.log('ID:', id);
    console.log('Body:', req.body);
    console.log('Files:', req.files);

    let { name, description, category, categories, code, dimensionLength, dimensionWidth, dimensionHeight, tags, price, priceType, inStock, featured, specs, features, existingImages } = req.body;

    // Parse JSON strings
    if (typeof specs === 'string') {
      try {
        specs = JSON.parse(specs);
      } catch (e) {
        console.warn('Failed to parse specs JSON:', e.message);
        specs = undefined;
      }
    }
    if (typeof features === 'string') {
      try {
        features = JSON.parse(features);
      } catch (e) {
        console.warn('Failed to parse features JSON:', e.message);
        features = undefined;
      }
    }
    if (typeof categories === 'string') {
      try {
        categories = JSON.parse(categories);
      } catch (e) {
        console.warn('Failed to parse categories JSON:', e.message);
        categories = undefined;
      }
    }
    if (typeof tags === 'string') {
      try {
        tags = JSON.parse(tags);
      } catch (e) {
        console.warn('Failed to parse tags JSON:', e.message);
        tags = undefined;
      }
    }
    if (typeof existingImages === 'string') {
      try {
        existingImages = JSON.parse(existingImages);
      } catch (e) {
        console.warn('Failed to parse existingImages JSON:', e.message);
        existingImages = [];
      }
    }
    // Check if product exists
    const existing = await prisma.product.findUnique({
      where: { id },
      include: { images: true, documents: true },
    });

    if (!existing) {
      return response.notFound(res, 'Product not found');
    }

    // Build update data
    const updateData = {};

    if (name) updateData.name = name;
    if (code !== undefined) updateData.code = code || null;
    if (dimensionLength !== undefined) updateData.dimensionLength = dimensionLength ? parseFloat(dimensionLength) : null;
    if (dimensionWidth !== undefined) updateData.dimensionWidth = dimensionWidth ? parseFloat(dimensionWidth) : null;
    if (dimensionHeight !== undefined) updateData.dimensionHeight = dimensionHeight ? parseFloat(dimensionHeight) : null;
    if (tags !== undefined && Array.isArray(tags)) {
      updateData.tags = tags.filter(t => t && t.trim());
    }
    if (description !== undefined) updateData.description = description || null;

    // Handle category change (supports both old single and new multi-category)
    let categoryRecords = [];
    if (categories && Array.isArray(categories) && categories.length > 0) {
      // New format: array of category slugs
      categoryRecords = await prisma.category.findMany({
        where: { slug: { in: categories } },
      });
      // Update primary categoryId for backward compatibility
      if (categoryRecords.length > 0) {
        updateData.categoryId = categoryRecords[0].id;
      }
    } else if (category) {
      // Old format: single category slug
      const categoryRecord = await prisma.category.findUnique({
        where: { slug: category },
      });
      if (categoryRecord) {
        updateData.categoryId = categoryRecord.id;
        categoryRecords = [categoryRecord];
      }
    }

    // Handle booleans
    if (featured !== undefined) {
      updateData.isFeatured = featured === 'true' || featured === true;
    }
    if (inStock !== undefined) {
      updateData.isActive = inStock === 'true' || inStock === true;
    }

    // Update product
    let product = await prisma.product.update({
      where: { id },
      data: updateData,
      include: productInclude,
    });

    // Update features if provided
    if (Array.isArray(features)) {
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

    // Update specs if provided (supports key-value objects and plain strings)
    if (Array.isArray(specs)) {
      await prisma.productDynamicSpec.deleteMany({ where: { productId: id } });
      if (specs.length > 0) {
        await prisma.productDynamicSpec.createMany({
          data: specs.map((spec, index) => {
            // Support new format: {key, value} objects
            if (typeof spec === 'object' && spec.key && spec.value) {
              return {
                productId: id,
                specKey: spec.key.trim(),
                specValue: spec.value.trim(),
                sortOrder: index,
              };
            }
            // Backward compatibility: plain string values
            return {
              productId: id,
              specKey: `spec_${index}`,
              specValue: String(spec),
              sortOrder: index,
            };
          }),
        });
      }
    }

    // Update categories if provided (via junction table)
    if (categoryRecords.length > 0) {
      // Delete existing category associations
      await prisma.productCategory.deleteMany({ where: { productId: id } });
      // Create new associations
      await prisma.productCategory.createMany({
        data: categoryRecords.map((cat) => ({
          productId: id,
          categoryId: cat.id,
        })),
      });
    }

    // Handle image removal - delete images not in existingImages list
    if (Array.isArray(existingImages)) {
      const existingImageUrls = existingImages.map(img => typeof img === 'string' ? img : img.imageUrl);
      const imagesToDelete = existing.images.filter(img => !existingImageUrls.includes(img.imageUrl));

      const uploadDir = process.env.UPLOAD_DIR || './uploads';
      for (const img of imagesToDelete) {
        console.log('Deleting removed image:', img.imageUrl);
        await imageService.deleteImage(path.join(uploadDir, img.imageUrl.replace('/uploads/', ''))).catch(() => {});
        await prisma.productImage.delete({ where: { id: img.id } });
      }
    }

    // Handle new image uploads (req.files is an object when using .fields())
    const imageFiles = req.files?.images || [];
    if (imageFiles.length > 0) {
      const existingCount = existingImages ? existingImages.length : 0;
      const hasPrimary = existingCount > 0;
      const imageData = imageFiles.map((file, index) => ({
        productId: id,
        imageUrl: `/uploads/products/images/${file.filename}`,
        isPrimary: !hasPrimary && index === 0,
        sortOrder: existingCount + index,
      }));
      await prisma.productImage.createMany({ data: imageData });
    }

    // Handle new document uploads
    const docFiles = req.files?.documents || [];
    if (docFiles.length > 0) {
      for (let i = 0; i < docFiles.length; i++) {
        const file = docFiles[i];
        // Parse document metadata from the request body
        let docMeta = { name: file.originalname.replace(/\.[^/.]+$/, ''), documentType: 'OTHER' };
        try {
          const metaKey = `documentMeta[${i}]`;
          if (req.body[metaKey]) {
            docMeta = JSON.parse(req.body[metaKey]);
          }
        } catch (e) {
          console.warn('Failed to parse document meta:', e.message);
        }

        await prisma.productDocument.create({
          data: {
            productId: id,
            name: docMeta.name || file.originalname,
            documentUrl: `/uploads/products/documents/${file.filename}`,
            documentType: docMeta.documentType || 'OTHER',
            fileSizeBytes: file.size,
          },
        });
      }
    }

    // Refetch product with all relations
    product = await prisma.product.findUnique({
      where: { id },
      include: productInclude,
    });

    console.log('Product updated:', product.id);
    response.success(res, product);
  } catch (error) {
    console.error('Product update error:', error);
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
      await imageService.deleteFile(resolveDocPath(doc.documentUrl)).catch(() => {});
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

    // Check if SKU already exists
    if (data.sku) {
      const existingSku = await prisma.productVariant.findUnique({
        where: { sku: data.sku },
      });
      if (existingSku) {
        return response.conflict(res, `SKU "${data.sku}" already exists`);
      }
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

    // Check if SKU already exists (excluding current variant)
    if (data.sku && data.sku !== existing.sku) {
      const existingSku = await prisma.productVariant.findUnique({
        where: { sku: data.sku },
      });
      if (existingSku) {
        return response.conflict(res, `SKU "${data.sku}" already exists`);
      }
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

    const images = [];
    const errors = [];

    for (let i = 0; i < req.files.length; i++) {
      const file = req.files[i];

      try {
        // Process image (resize, optimize)
        await imageService.processImage(file.path);
      } catch (processError) {
        // Log error but continue - the original file is still usable
        console.warn(`Failed to process image ${file.filename}:`, processError.message);
        errors.push({ file: file.filename, error: processError.message });
      }

      // Use consistent URL format
      const imageUrl = `/uploads/products/images/${file.filename}`;

      // Create image record
      const image = await prisma.productImage.create({
        data: {
          productId: id,
          imageUrl,
          isPrimary: !hasPrimary && i === 0, // First image is primary if none exists
          sortOrder: i,
        },
      });

      images.push(image);
    }

    // Return images with any processing warnings
    const result = { images };
    if (errors.length > 0) {
      result.warnings = errors;
    }
    response.created(res, result);
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
    const relativePath = path.relative(uploadDir, req.file.path).replace(/\\/g, '/');

    // Create document record - use /uploads/ prefix for consistency with inline uploads
    const document = await prisma.productDocument.create({
      data: {
        productId: id,
        name: name || req.file.originalname,
        documentUrl: `/uploads/${relativePath}`,
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
    await imageService.deleteFile(resolveDocPath(existing.documentUrl)).catch(() => {});

    // Delete record
    await prisma.productDocument.delete({
      where: { id: docId },
    });

    response.noContent(res);
  } catch (error) {
    next(error);
  }
}

async function updateDocument(req, res, next) {
  try {
    const { id, docId } = req.params;
    const { documentType, name } = req.body;

    const existing = await prisma.productDocument.findFirst({
      where: { id: docId, productId: id },
    });

    if (!existing) {
      return response.notFound(res, 'Document not found');
    }

    const updateData = {};
    if (documentType !== undefined) updateData.documentType = documentType;
    if (name !== undefined) updateData.name = name;

    const updated = await prisma.productDocument.update({
      where: { id: docId },
      data: updateData,
    });

    response.success(res, updated);
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
  updateDocument,
  removeDocument,
};
