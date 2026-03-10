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

// ===== Category Schemas =====

const createDownloadCategorySchema = {
  body: z.object({
    name: z.string().min(1, 'Name is required').max(200),
    description: z.string().optional(),
    icon: z.string().max(50).optional().default('catalog'),
    sortOrder: numberFromFormData.default(0),
    isActive: booleanFromFormData.default(true),
  }),
};

const updateDownloadCategorySchema = {
  params: z.object({
    id: z.string().uuid('Invalid category ID'),
  }),
  body: z.object({
    name: z.string().min(1).max(200).optional(),
    description: z.string().optional().nullable(),
    icon: z.string().max(50).optional(),
    sortOrder: numberFromFormData,
    isActive: booleanFromFormData,
  }),
};

// ===== Download Schemas =====

const createDownloadSchema = {
  body: z.object({
    name: z.string().min(1, 'Name is required').max(200),
    description: z.string().optional(),
    categoryId: z.string().uuid('Invalid category ID'),
    sortOrder: numberFromFormData.default(0),
    isActive: booleanFromFormData.default(true),
  }),
};

const updateDownloadSchema = {
  params: z.object({
    id: z.string().uuid('Invalid download ID'),
  }),
  body: z.object({
    name: z.string().min(1).max(200).optional(),
    description: z.string().optional().nullable(),
    categoryId: z.string().uuid('Invalid category ID').optional(),
    sortOrder: numberFromFormData,
    isActive: booleanFromFormData,
  }),
};

const downloadIdSchema = {
  params: z.object({
    id: z.string().uuid('Invalid download ID'),
  }),
};

const downloadCategoryIdSchema = {
  params: z.object({
    id: z.string().uuid('Invalid category ID'),
  }),
};

module.exports = {
  createDownloadCategorySchema,
  updateDownloadCategorySchema,
  createDownloadSchema,
  updateDownloadSchema,
  downloadIdSchema,
  downloadCategoryIdSchema,
};
