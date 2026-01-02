const express = require('express');
const { galleryController } = require('../controllers');
const { authenticate, validate, uploadImage } = require('../middleware');
const {
  createGallerySchema,
  updateGallerySchema,
  galleryIdSchema,
  galleryQuerySchema,
  updateOrderSchema,
  linkProductsSchema,
} = require('../validators');

const router = express.Router();

// Public routes (specific paths first)
router.get('/featured', galleryController.getFeatured);

// Admin routes (specific paths before :id)
router.get('/admin/list', authenticate, validate(galleryQuerySchema), galleryController.adminGetAll);
router.put('/order/bulk', authenticate, validate(updateOrderSchema), galleryController.updateOrder);

// Public list
router.get('/', validate(galleryQuerySchema), galleryController.getAll);

// Routes with :id parameter (must come after specific paths)
router.get('/:id', validate(galleryIdSchema), galleryController.getById);
router.post(
  '/',
  authenticate,
  uploadImage.single('image'),
  validate(createGallerySchema),
  galleryController.create
);
router.put(
  '/:id',
  authenticate,
  uploadImage.single('image'),
  validate(updateGallerySchema),
  galleryController.update
);
router.delete('/:id', authenticate, validate(galleryIdSchema), galleryController.remove);
router.put('/:id/products', authenticate, validate(linkProductsSchema), galleryController.linkProducts);

module.exports = router;
