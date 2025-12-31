const { z } = require('zod');
const { constants } = require('../config');

const submitInquirySchema = {
  body: z.object({
    inquiryType: z.enum(Object.values(constants.INQUIRY_TYPE)).optional().default('GENERAL'),
    companyName: z.string().max(200).optional(),
    contactName: z.string().min(1, 'Name is required').max(100),
    email: z.string().email('Invalid email format'),
    phone: z.string().max(50).optional(),
    subject: z.string().max(200).optional(),
    message: z.string().min(1, 'Message is required'),
  }),
};

const updateInquirySchema = {
  params: z.object({
    id: z.string().uuid('Invalid inquiry ID'),
  }),
  body: z.object({
    status: z.enum(Object.values(constants.INQUIRY_STATUS)).optional(),
    internalNotes: z.string().optional().nullable(),
  }),
};

const inquiryIdSchema = {
  params: z.object({
    id: z.string().uuid('Invalid inquiry ID'),
  }),
};

const inquiryQuerySchema = {
  query: z.object({
    page: z.string().optional(),
    limit: z.string().optional(),
    sort: z.string().optional(),
    order: z.enum(['asc', 'desc']).optional(),
    status: z.enum(Object.values(constants.INQUIRY_STATUS)).optional(),
    type: z.enum(Object.values(constants.INQUIRY_TYPE)).optional(),
    search: z.string().optional(),
  }),
};

module.exports = {
  submitInquirySchema,
  updateInquirySchema,
  inquiryIdSchema,
  inquiryQuerySchema,
};
