const { z } = require('zod');

// Helper to handle FormData strings for booleans
const booleanFromFormData = z.union([
  z.boolean(),
  z.string().transform(val => val === 'true'),
]).optional();

// Helper to handle FormData strings for numbers
const numberFromFormData = z.union([
  z.number(),
  z.string().transform(val => parseInt(val, 10)),
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

const createCategorySchema = {
  body: z.object({
    name: z.string().min(1, 'Name is required').max(100),
    slug: z.string().min(1).max(100).optional(),
    code: z.string().max(50).optional(),
    description: z.string().optional(),
    isFeatured: booleanFromFormData.default(false),
    sortOrder: numberFromFormData.default(0),
    specs: arrayFromFormData,
  }),
};

const updateCategorySchema = {
  params: z.object({
    id: z.string().uuid('Invalid category ID'),
  }),
  body: z.object({
    name: z.string().min(1).max(100).optional(),
    slug: z.string().min(1).max(100).optional(),
    code: z.string().max(50).optional().nullable(),
    description: z.string().optional().nullable(),
    isFeatured: booleanFromFormData,
    sortOrder: numberFromFormData,
    specs: arrayFromFormData,
    existingImage: z.string().optional(),
    removeImage: z.string().optional(), // Flag to explicitly remove the image
  }),
};

const categoryIdSchema = {
  params: z.object({
    id: z.string().uuid('Invalid category ID'),
  }),
};

const categorySlugSchema = {
  params: z.object({
    slug: z.string().min(1, 'Slug is required'),
  }),
};

module.exports = {
  createCategorySchema,
  updateCategorySchema,
  categoryIdSchema,
  categorySlugSchema,
};
