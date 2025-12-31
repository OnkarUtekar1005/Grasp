const express = require('express');
const { productController } = require('../controllers');
const { authenticate, validate, uploadImage, uploadDocument } = require('../middleware');
const {
  createProductSchema,
  updateProductSchema,
  productIdSchema,
  productSlugSchema,
  productQuerySchema,
  createVariantSchema,
  updateVariantSchema,
  variantIdSchema,
  updateImageSchema,
  imageIdSchema,
  documentIdSchema,
} = require('../validators');

const router = express.Router();

// Public routes
router.get('/', validate(productQuerySchema), productController.getAll);
router.get('/featured', productController.getFeatured);
router.get('/search', productController.search);
router.get('/category/:slug', productController.getByCategory);
router.get('/:slug', validate(productSlugSchema), productController.getBySlug);

// Admin routes - Products
router.post('/', authenticate, validate(createProductSchema), productController.create);
router.put('/:id', authenticate, validate(updateProductSchema), productController.update);
router.delete('/:id', authenticate, validate(productIdSchema), productController.remove);

// Admin routes - Variants
router.post('/:id/variants', authenticate, validate(createVariantSchema), productController.addVariant);
router.put('/:id/variants/:variantId', authenticate, validate(updateVariantSchema), productController.updateVariant);
router.delete('/:id/variants/:variantId', authenticate, validate(variantIdSchema), productController.removeVariant);

// Admin routes - Images
router.post(
  '/:id/images',
  authenticate,
  validate(productIdSchema),
  uploadImage.array('images', 10),
  productController.uploadImages
);
router.put('/:id/images/:imageId', authenticate, validate(updateImageSchema), productController.updateImage);
router.delete('/:id/images/:imageId', authenticate, validate(imageIdSchema), productController.removeImage);

// Admin routes - Documents
router.post(
  '/:id/documents',
  authenticate,
  validate(productIdSchema),
  uploadDocument.single('document'),
  productController.uploadDocument
);
router.delete('/:id/documents/:docId', authenticate, validate(documentIdSchema), productController.removeDocument);

module.exports = router;
