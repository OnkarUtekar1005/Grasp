const { z } = require('zod');

const createProductSchema = {
  body: z.object({
    categoryId: z.string().uuid('Invalid category ID'),
    name: z.string().min(1, 'Name is required').max(200),
    slug: z.string().min(1).max(200).optional(),
    code: z.string().max(50).optional(),
    description: z.string().optional(),
    fullDescription: z.string().optional(),

    // Specifications
    specMaterial: z.string().max(100).optional(),
    specIpRating: z.string().max(20).optional(),
    specFlammability: z.string().max(50).optional(),
    specColor: z.string().max(50).optional(),
    specDoorType: z.string().max(100).optional(),
    specMounting: z.string().max(100).optional(),
    specTemperatureRange: z.string().max(50).optional(),

    // Status
    isFeatured: z.boolean().optional().default(false),
    isActive: z.boolean().optional().default(true),

    // Related data
    features: z.array(z.string()).optional(),
    dynamicSpecs: z
      .array(
        z.object({
          key: z.string().min(1),
          value: z.string().min(1),
        })
      )
      .optional(),
  }),
};

const updateProductSchema = {
  params: z.object({
    id: z.string().uuid('Invalid product ID'),
  }),
  body: z.object({
    categoryId: z.string().uuid('Invalid category ID').optional(),
    name: z.string().min(1).max(200).optional(),
    slug: z.string().min(1).max(200).optional(),
    code: z.string().max(50).optional().nullable(),
    description: z.string().optional().nullable(),
    fullDescription: z.string().optional().nullable(),

    specMaterial: z.string().max(100).optional().nullable(),
    specIpRating: z.string().max(20).optional().nullable(),
    specFlammability: z.string().max(50).optional().nullable(),
    specColor: z.string().max(50).optional().nullable(),
    specDoorType: z.string().max(100).optional().nullable(),
    specMounting: z.string().max(100).optional().nullable(),
    specTemperatureRange: z.string().max(50).optional().nullable(),

    isFeatured: z.boolean().optional(),
    isActive: z.boolean().optional(),

    features: z.array(z.string()).optional(),
    dynamicSpecs: z
      .array(
        z.object({
          key: z.string().min(1),
          value: z.string().min(1),
        })
      )
      .optional(),
  }),
};

const productIdSchema = {
  params: z.object({
    id: z.string().uuid('Invalid product ID'),
  }),
};

const productSlugSchema = {
  params: z.object({
    slug: z.string().min(1, 'Slug is required'),
  }),
};

const productQuerySchema = {
  query: z.object({
    page: z.string().optional(),
    limit: z.string().optional(),
    sort: z.string().optional(),
    order: z.enum(['asc', 'desc']).optional(),
    category: z.string().optional(),
    material: z.string().optional(),
    ipRating: z.string().optional(),
    isFeatured: z.string().optional(),
    isActive: z.string().optional(),
    search: z.string().optional(),
    inStock: z.string().optional(),
  }),
};

// Variant schemas
const createVariantSchema = {
  params: z.object({
    id: z.string().uuid('Invalid product ID'),
  }),
  body: z.object({
    sku: z.string().min(1, 'SKU is required').max(50),
    name: z.string().min(1, 'Name is required').max(100),
    specDimensions: z.string().max(100).optional(),
    specWeight: z.string().max(50).optional(),
    stockQuantity: z.number().int().min(0).optional().default(0),
    lowStockThreshold: z.number().int().min(0).optional().default(10),
    isActive: z.boolean().optional().default(true),
    sortOrder: z.number().int().optional().default(0),
  }),
};

const updateVariantSchema = {
  params: z.object({
    id: z.string().uuid('Invalid product ID'),
    variantId: z.string().uuid('Invalid variant ID'),
  }),
  body: z.object({
    sku: z.string().min(1).max(50).optional(),
    name: z.string().min(1).max(100).optional(),
    specDimensions: z.string().max(100).optional().nullable(),
    specWeight: z.string().max(50).optional().nullable(),
    stockQuantity: z.number().int().min(0).optional(),
    lowStockThreshold: z.number().int().min(0).optional(),
    isActive: z.boolean().optional(),
    sortOrder: z.number().int().optional(),
  }),
};

const variantIdSchema = {
  params: z.object({
    id: z.string().uuid('Invalid product ID'),
    variantId: z.string().uuid('Invalid variant ID'),
  }),
};

// Image schemas
const updateImageSchema = {
  params: z.object({
    id: z.string().uuid('Invalid product ID'),
    imageId: z.string().uuid('Invalid image ID'),
  }),
  body: z.object({
    altText: z.string().max(200).optional().nullable(),
    isPrimary: z.boolean().optional(),
    sortOrder: z.number().int().optional(),
  }),
};

const imageIdSchema = {
  params: z.object({
    id: z.string().uuid('Invalid product ID'),
    imageId: z.string().uuid('Invalid image ID'),
  }),
};

// Document schemas
const documentIdSchema = {
  params: z.object({
    id: z.string().uuid('Invalid product ID'),
    docId: z.string().uuid('Invalid document ID'),
  }),
};

module.exports = {
  createProductSchema,
  updateProductSchema,
  productIdSchema,
  productSlugSchema,
  productQuerySchema,
  createVariantSchema,
  updateVariantSchema,
  variantIdSchema,
  updateImageSchema,
  imageIdSchema,
  documentIdSchema,
};
