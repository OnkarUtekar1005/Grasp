const express = require('express');
const authRoutes = require('./auth.routes');
const adminRoutes = require('./admin.routes');
const categoryRoutes = require('./category.routes');
const productRoutes = require('./product.routes');
const quoteRoutes = require('./quote.routes');
const inquiryRoutes = require('./inquiry.routes');
const dashboardRoutes = require('./dashboard.routes');
const galleryRoutes = require('./gallery.routes');
const pdfRoutes = require('./pdf.routes');

const router = express.Router();

// Health check
router.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Mount routes
router.use('/auth', authRoutes);
router.use('/admins', adminRoutes);
router.use('/categories', categoryRoutes);
router.use('/products', productRoutes);
router.use('/quotes', quoteRoutes);
router.use('/inquiries', inquiryRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/gallery', galleryRoutes);
router.use('/pdf', pdfRoutes);

module.exports = router;
