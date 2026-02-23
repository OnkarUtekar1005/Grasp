const express = require('express');
const pdfController = require('../controllers/pdf.controller');

const router = express.Router();

/**
 * @route   GET /api/v1/pdf/products/:slug
 * @desc    Generate and download PDF datasheet for a product
 * @access  Public
 */
router.get('/products/:slug', pdfController.generateProductPDF);

/**
 * @route   GET /api/v1/pdf/catalog
 * @desc    Generate and download full product catalog PDF
 * @access  Public
 */
router.get('/catalog', pdfController.generateCatalogPDF);

module.exports = router;
