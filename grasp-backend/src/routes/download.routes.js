const express = require('express');
const { downloadController } = require('../controllers');
const { authenticate, validate, uploadDocument } = require('../middleware');
const {
  createDownloadCategorySchema,
  updateDownloadCategorySchema,
  createDownloadSchema,
  updateDownloadSchema,
  downloadIdSchema,
  downloadCategoryIdSchema,
} = require('../validators');

const router = express.Router();

// Public routes
router.get('/', downloadController.getAll);

// Admin: Category routes
router.get('/admin/categories', authenticate, downloadController.adminGetCategories);
router.post('/admin/categories', authenticate, validate(createDownloadCategorySchema), downloadController.createCategory);
router.put('/admin/categories/:id', authenticate, validate(updateDownloadCategorySchema), downloadController.updateCategory);
router.delete('/admin/categories/:id', authenticate, validate(downloadCategoryIdSchema), downloadController.deleteCategory);

// Admin: Download routes
router.get('/admin/list', authenticate, downloadController.adminGetAll);
router.get('/admin/:id', authenticate, validate(downloadIdSchema), downloadController.getById);
router.post(
  '/',
  authenticate,
  uploadDocument.single('document'),
  validate(createDownloadSchema),
  downloadController.create
);
router.put(
  '/:id',
  authenticate,
  uploadDocument.single('document'),
  validate(updateDownloadSchema),
  downloadController.update
);
router.delete('/:id', authenticate, validate(downloadIdSchema), downloadController.remove);

module.exports = router;
