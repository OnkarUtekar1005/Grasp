const { z } = require('zod');
const { constants } = require('../config');

const submitQuoteSchema = {
  body: z.object({
    companyName: z.string().min(1, 'Company name is required').max(200),
    contactName: z.string().min(1, 'Contact name is required').max(100),
    email: z.string().email('Invalid email format'),
    phone: z.string().max(50).nullish(),
    message: z.string().nullish(),
    items: z
      .array(
        z.object({
          productId: z.string().uuid('Invalid product ID'),
          variantId: z.string().uuid('Invalid variant ID').nullish(),
          quantity: z.coerce.number().int().min(1, 'Quantity must be at least 1'),
          notes: z.string().nullish(),
        })
      )
      .min(1, 'At least one item is required'),
  }),
};

const updateQuoteSchema = {
  params: z.object({
    id: z.string().uuid('Invalid quote ID'),
  }),
  body: z.object({
    status: z.enum(Object.values(constants.QUOTE_STATUS)).optional(),
    internalNotes: z.string().optional().nullable(),
    quoteValidUntil: z.string().datetime().optional().nullable(),
    totalQuotedAmount: z.number().min(0).optional().nullable(),
    items: z
      .array(
        z.object({
          id: z.string().uuid().optional(),
          quotedUnitPrice: z.number().min(0).optional(),
          quotedTotal: z.number().min(0).optional(),
          notes: z.string().optional(),
        })
      )
      .optional(),
  }),
};

const quoteIdSchema = {
  params: z.object({
    id: z.string().uuid('Invalid quote ID'),
  }),
};

const quoteQuerySchema = {
  query: z.object({
    page: z.string().optional(),
    limit: z.string().optional(),
    sort: z.string().optional(),
    order: z.enum(['asc', 'desc']).optional(),
    status: z.enum(Object.values(constants.QUOTE_STATUS)).optional(),
    search: z.string().optional(),
  }),
};

module.exports = {
  submitQuoteSchema,
  updateQuoteSchema,
  quoteIdSchema,
  quoteQuerySchema,
};
