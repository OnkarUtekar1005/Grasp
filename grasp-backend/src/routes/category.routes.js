const express = require('express');
const { categoryController } = require('../controllers');
const { authenticate, validate, uploadImage } = require('../middleware');
const {
  createCategorySchema,
  updateCategorySchema,
  categoryIdSchema,
  categorySlugSchema,
} = require('../validators');

const router = express.Router();

// Public routes
router.get('/', categoryController.getAll);
router.get('/:slug', validate(categorySlugSchema), categoryController.getBySlug);

// Admin routes
router.post('/', authenticate, validate(createCategorySchema), categoryController.create);
router.put('/:id', authenticate, validate(updateCategorySchema), categoryController.update);
router.delete('/:id', authenticate, validate(categoryIdSchema), categoryController.remove);
router.post(
  '/:id/image',
  authenticate,
  validate(categoryIdSchema),
  uploadImage.single('image'),
  categoryController.uploadImage
);

module.exports = router;
