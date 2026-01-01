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
    console.log('=== Product Create ===');
    console.log('Body:', req.body);
    console.log('Files:', req.files);

    let { name, description, category, code, price, priceType, inStock, featured, specs, features } = req.body;

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

    // Find category by slug
    const categoryRecord = await prisma.category.findUnique({
      where: { slug: category },
    });

    if (!categoryRecord) {
      return response.badRequest(res, 'Category not found');
    }

    // Generate slug
    let slug = generateSlug(name);
    slug = await generateUniqueSlug(slug, async (s) => {
      const existing = await prisma.product.findUnique({ where: { slug: s } });
      return !!existing;
    });

    // Parse price
    const parsedPrice = price === '' || price === null ? null : parseFloat(price);

    // Create product
    const product = await prisma.product.create({
      data: {
        categoryId: categoryRecord.id,
        name,
        slug,
        code: code || null,
        description: description || null,
        isFeatured: featured === 'true' || featured === true,
        isActive: true,
        // Store specs as dynamicSpecs
        dynamicSpecs: Array.isArray(specs) && specs.length > 0
          ? {
              create: specs.map((specValue, index) => ({
                specKey: `spec_${index}`,
                specValue,
                sortOrder: index,
              })),
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
        let docMeta = { name: file.originalname.replace(/\.[^/.]+$/, ''), documentType: 'DATASHEET' };
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
            documentType: docMeta.documentType || 'DATASHEET',
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

    let { name, description, category, code, price, priceType, inStock, featured, specs, features, existingImages, existingDocuments } = req.body;

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
    if (typeof existingImages === 'string') {
      try {
        existingImages = JSON.parse(existingImages);
      } catch (e) {
        console.warn('Failed to parse existingImages JSON:', e.message);
        existingImages = [];
      }
    }
    if (typeof existingDocuments === 'string') {
      try {
        existingDocuments = JSON.parse(existingDocuments);
      } catch (e) {
        console.warn('Failed to parse existingDocuments JSON:', e.message);
        existingDocuments = [];
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
    if (description !== undefined) updateData.description = description || null;

    // Handle category change
    if (category) {
      const categoryRecord = await prisma.category.findUnique({
        where: { slug: category },
      });
      if (categoryRecord) {
        updateData.categoryId = categoryRecord.id;
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

    // Update specs if provided
    if (Array.isArray(specs)) {
      await prisma.productDynamicSpec.deleteMany({ where: { productId: id } });
      if (specs.length > 0) {
        await prisma.productDynamicSpec.createMany({
          data: specs.map((specValue, index) => ({
            productId: id,
            specKey: `spec_${index}`,
            specValue,
            sortOrder: index,
          })),
        });
      }
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

    // Handle document removal - delete documents not in existingDocuments list
    if (Array.isArray(existingDocuments)) {
      const existingDocIds = existingDocuments.map(doc => doc.id).filter(Boolean);
      const docsToDelete = existing.documents.filter(doc => !existingDocIds.includes(doc.id));

      const uploadDir = process.env.UPLOAD_DIR || './uploads';
      for (const doc of docsToDelete) {
        console.log('Deleting removed document:', doc.documentUrl);
        await imageService.deleteFile(path.join(uploadDir, doc.documentUrl.replace('/uploads/', ''))).catch(() => {});
        await prisma.productDocument.delete({ where: { id: doc.id } });
      }
    }

    // Handle new document uploads
    const docFiles = req.files?.documents || [];
    if (docFiles.length > 0) {
      for (let i = 0; i < docFiles.length; i++) {
        const file = docFiles[i];
        // Parse document metadata from the request body
        let docMeta = { name: file.originalname.replace(/\.[^/.]+$/, ''), documentType: 'DATASHEET' };
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
            documentType: docMeta.documentType || 'DATASHEET',
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
