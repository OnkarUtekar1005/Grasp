const express = require('express');
const { inquiryController } = require('../controllers');
const { authenticate, validate } = require('../middleware');
const {
  submitInquirySchema,
  updateInquirySchema,
  inquiryIdSchema,
  inquiryQuerySchema,
} = require('../validators');

const router = express.Router();

// Public routes
router.post('/', validate(submitInquirySchema), inquiryController.submit);

// Admin routes
router.get('/', authenticate, validate(inquiryQuerySchema), inquiryController.getAll);
router.get('/:id', authenticate, validate(inquiryIdSchema), inquiryController.getById);
router.put('/:id', authenticate, validate(updateInquirySchema), inquiryController.update);
router.delete('/:id', authenticate, validate(inquiryIdSchema), inquiryController.remove);

module.exports = router;
