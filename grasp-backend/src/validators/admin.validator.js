const { z } = require('zod');

const createAdminSchema = {
  body: z.object({
    email: z.string().email('Invalid email format'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number'),
    name: z.string().min(1, 'Name is required').max(100),
  }),
};

const updateAdminSchema = {
  params: z.object({
    id: z.string().uuid('Invalid admin ID'),
  }),
  body: z.object({
    email: z.string().email('Invalid email format').optional(),
    name: z.string().min(1).max(100).optional(),
    isActive: z.boolean().optional(),
  }),
};

const adminIdSchema = {
  params: z.object({
    id: z.string().uuid('Invalid admin ID'),
  }),
};

module.exports = {
  createAdminSchema,
  updateAdminSchema,
  adminIdSchema,
};
