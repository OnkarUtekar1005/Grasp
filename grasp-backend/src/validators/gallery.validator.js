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
    const num = parseInt(val, 10);
    return isNaN(num) ? 0 : num;
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

const createGallerySchema = {
  body: z.object({
    title: z.string().min(1, 'Title is required').max(200),
    description: z.string().optional(),
    altText: z.string().max(200).optional(),
    isFeatured: booleanFromFormData.default(false),
    isActive: booleanFromFormData.default(true),
    sortOrder: numberFromFormData.default(0),
    productIds: arrayFromFormData,
  }),
};

const updateGallerySchema = {
  params: z.object({
    id: z.string().uuid('Invalid gallery image ID'),
  }),
  body: z.object({
    title: z.string().min(1).max(200).optional(),
    description: z.string().optional().nullable(),
    altText: z.string().max(200).optional().nullable(),
    isFeatured: booleanFromFormData,
    isActive: booleanFromFormData,
    sortOrder: numberFromFormData,
    productIds: arrayFromFormData,
  }),
};

const galleryIdSchema = {
  params: z.object({
    id: z.string().uuid('Invalid gallery image ID'),
  }),
};

const galleryQuerySchema = {
  query: z.object({
    page: z.string().optional().transform(val => parseInt(val) || 1),
    limit: z.string().optional().transform(val => parseInt(val) || 20),
    isFeatured: z.string().optional().transform(val => val === 'true'),
    isActive: z.string().optional(),
    search: z.string().optional(),
    sort: z.string().optional(),
  }),
};

const updateOrderSchema = {
  body: z.object({
    items: z.array(z.object({
      id: z.string().uuid('Invalid gallery image ID'),
      sortOrder: z.number().int(),
    })),
  }),
};

const linkProductsSchema = {
  params: z.object({
    id: z.string().uuid('Invalid gallery image ID'),
  }),
  body: z.object({
    productIds: z.array(z.string().uuid('Invalid product ID')),
  }),
};

module.exports = {
  createGallerySchema,
  updateGallerySchema,
  galleryIdSchema,
  galleryQuerySchema,
  updateOrderSchema,
  linkProductsSchema,
};
