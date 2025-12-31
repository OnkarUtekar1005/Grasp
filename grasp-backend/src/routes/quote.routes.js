const express = require('express');
const { quoteController } = require('../controllers');
const { authenticate, validate } = require('../middleware');
const {
  submitQuoteSchema,
  updateQuoteSchema,
  quoteIdSchema,
  quoteQuerySchema,
} = require('../validators');

const router = express.Router();

// Public routes
router.post('/', validate(submitQuoteSchema), quoteController.submit);

// Admin routes
router.get('/', authenticate, validate(quoteQuerySchema), quoteController.getAll);
router.get('/:id', authenticate, validate(quoteIdSchema), quoteController.getById);
router.put('/:id', authenticate, validate(updateQuoteSchema), quoteController.update);
router.delete('/:id', authenticate, validate(quoteIdSchema), quoteController.remove);

module.exports = router;
