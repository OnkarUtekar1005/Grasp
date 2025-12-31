const express = require('express');
const { dashboardController } = require('../controllers');
const { authenticate } = require('../middleware');

const router = express.Router();

// All routes require authentication
router.use(authenticate);

router.get('/stats', dashboardController.getStats);

module.exports = router;
