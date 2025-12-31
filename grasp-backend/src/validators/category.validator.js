const { z } = require('zod');

const createCategorySchema = {
  body: z.object({
    name: z.string().min(1, 'Name is required').max(100),
    slug: z.string().min(1).max(100).optional(),
    code: z.string().max(50).optional(),
    description: z.string().optional(),
    isFeatured: z.boolean().optional().default(false),
    sortOrder: z.number().int().optional().default(0),
    specs: z.array(z.string()).optional(),
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
    isFeatured: z.boolean().optional(),
    sortOrder: z.number().int().optional(),
    specs: z.array(z.string()).optional(),
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
