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

// Spec object schema for key-value pairs
const specObjectSchema = z.object({
  key: z.string().min(1, 'Spec key is required').max(100),
  value: z.string().min(1, 'Spec value is required').max(500),
});

// Helper to handle FormData JSON strings for specs (key-value objects)
const specsArrayFromFormData = z.union([
  z.array(specObjectSchema),
  z.array(z.string()), // Backward compatibility: plain strings
  z.string().transform(val => {
    try {
      const parsed = JSON.parse(val);
      if (Array.isArray(parsed)) {
        return parsed.map(item => {
          if (typeof item === 'string') {
            // Old format: convert to key-value
            return { key: 'Specification', value: item };
          }
          return item;
        });
      }
      return [];
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
    dimensionLength: z.union([z.number().min(0), z.string().transform(val => val === '' ? null : parseFloat(val))]).optional().nullable().refine(val => val === null || val === undefined || val >= 0, { message: 'Length must be positive' }),
    dimensionWidth: z.union([z.number().min(0), z.string().transform(val => val === '' ? null : parseFloat(val))]).optional().nullable().refine(val => val === null || val === undefined || val >= 0, { message: 'Width must be positive' }),
    dimensionHeight: z.union([z.number().min(0), z.string().transform(val => val === '' ? null : parseFloat(val))]).optional().nullable().refine(val => val === null || val === undefined || val >= 0, { message: 'Height must be positive' }),
    tags: arrayFromFormData, // Tags for filtering (array of strings)
    price: z.union([
      z.number(),
      z.string().transform(val => val === '' ? null : parseFloat(val)),
    ]).optional().nullable(),
    priceType: z.string().optional(),
    inStock: booleanFromFormData.default(true),
    featured: booleanFromFormData.default(false),
    specs: specsArrayFromFormData,
    features: arrayFromFormData,
    existingImages: z.string().optional(), // JSON string of existing images
  }).passthrough().refine(
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
    dimensionLength: z.union([z.number().min(0), z.string().transform(val => val === '' ? null : parseFloat(val))]).optional().nullable().refine(val => val === null || val === undefined || val >= 0, { message: 'Length must be positive' }),
    dimensionWidth: z.union([z.number().min(0), z.string().transform(val => val === '' ? null : parseFloat(val))]).optional().nullable().refine(val => val === null || val === undefined || val >= 0, { message: 'Width must be positive' }),
    dimensionHeight: z.union([z.number().min(0), z.string().transform(val => val === '' ? null : parseFloat(val))]).optional().nullable().refine(val => val === null || val === undefined || val >= 0, { message: 'Height must be positive' }),
    tags: arrayFromFormData, // Tags for filtering (array of strings)
    price: z.union([
      z.number(),
      z.string().transform(val => val === '' ? null : parseFloat(val)),
    ]).optional().nullable(),
    priceType: z.string().optional(),
    inStock: booleanFromFormData,
    featured: booleanFromFormData,
    specs: specsArrayFromFormData,
    features: arrayFromFormData,
    existingImages: z.string().optional(), // JSON string of existing images
  }).passthrough(),
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
    minLength: z.string().optional(),
    maxLength: z.string().optional(),
    minWidth: z.string().optional(),
    maxWidth: z.string().optional(),
    minHeight: z.string().optional(),
    maxHeight: z.string().optional(),
    tags: z.string().optional(), // Comma-separated tag values for filtering
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
