const { z } = require('zod');

// Helper to handle FormData strings for booleans
const booleanFromFormData = z.union([
  z.boolean(),
  z.string().transform(val => val === 'true'),
]).optional();

// Helper to handle FormData strings for numbers
const numberFromFormData = z.union([
  z.number(),
  z.string().transform(val => {
    const num = parseFloat(val);
    return isNaN(num) ? undefined : num;
  }),
]).optional();

// Helper to handle FormData JSON strings for arrays
const arrayFromFormData = z.union([
  z.array(z.string()),
  z.string().transform(val => {
    try {
      return JSON.parse(val);
    } catch {
      return [];
    }
  }),
]).optional();

const createProductSchema = {
  body: z.object({
    name: z.string().min(1, 'Name is required').max(200),
    description: z.string().optional(),
    category: z.string().optional(), // Deprecated: single category slug (backward compat)
    categories: arrayFromFormData, // New: array of category slugs
    code: z.string().max(50).optional(),
    price: z.union([
      z.number(),
      z.string().transform(val => val === '' ? null : parseFloat(val)),
    ]).optional().nullable(),
    priceType: z.string().optional(),
    inStock: booleanFromFormData.default(true),
    featured: booleanFromFormData.default(false),
    specs: arrayFromFormData,
    features: arrayFromFormData,
    existingImages: z.string().optional(), // JSON string of existing images
  }).refine(
    data => data.category || (data.categories && data.categories.length > 0),
    { message: 'At least one category is required', path: ['categories'] }
  ),
};

const updateProductSchema = {
  params: z.object({
    id: z.string().uuid('Invalid product ID'),
  }),
  body: z.object({
    name: z.string().min(1).max(200).optional(),
    description: z.string().optional().nullable(),
    category: z.string().optional(), // Deprecated: single category slug (backward compat)
    categories: arrayFromFormData, // New: array of category slugs
    code: z.string().max(50).optional().nullable(),
    price: z.union([
      z.number(),
      z.string().transform(val => val === '' ? null : parseFloat(val)),
    ]).optional().nullable(),
    priceType: z.string().optional(),
    inStock: booleanFromFormData,
    featured: booleanFromFormData,
    specs: arrayFromFormData,
    features: arrayFromFormData,
    existingImages: z.string().optional(), // JSON string of existing images
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
    page: z.string().optional().transform(val => parseInt(val) || 1),
    limit: z.string().optional().transform(val => parseInt(val) || 20),
    category: z.string().optional(),
    featured: z.string().optional().transform(val => val === 'true'),
    search: z.string().optional(),
    sort: z.string().optional(),
  }),
};

const createVariantSchema = {
  params: z.object({
    id: z.string().uuid('Invalid product ID'),
  }),
  body: z.object({
    name: z.string().min(1, 'Variant name is required').max(100),
    sku: z.string().max(50).optional(),
    price: z.number().positive().optional(),
    attributes: z.record(z.string()).optional(),
    inStock: z.boolean().optional().default(true),
    sortOrder: z.number().int().optional().default(0),
  }),
};

const updateVariantSchema = {
  params: z.object({
    id: z.string().uuid('Invalid product ID'),
    variantId: z.string().uuid('Invalid variant ID'),
  }),
  body: z.object({
    name: z.string().min(1).max(100).optional(),
    sku: z.string().max(50).optional().nullable(),
    price: z.number().positive().optional().nullable(),
    attributes: z.record(z.string()).optional(),
    inStock: z.boolean().optional(),
    sortOrder: z.number().int().optional(),
  }),
};

const variantIdSchema = {
  params: z.object({
    id: z.string().uuid('Invalid product ID'),
    variantId: z.string().uuid('Invalid variant ID'),
  }),
};

const updateImageSchema = {
  params: z.object({
    id: z.string().uuid('Invalid product ID'),
    imageId: z.string().uuid('Invalid image ID'),
  }),
  body: z.object({
    altText: z.string().max(200).optional(),
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
