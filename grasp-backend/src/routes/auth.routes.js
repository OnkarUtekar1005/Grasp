const express = require('express');
const { authController } = require('../controllers');
const { authenticate, validate } = require('../middleware');
const { loginSchema, changePasswordSchema } = require('../validators');

const router = express.Router();

// Public routes
router.post('/login', validate(loginSchema), authController.login);

// Protected routes
router.post('/logout', authenticate, authController.logout);
router.get('/me', authenticate, authController.me);
router.put('/change-password', authenticate, validate(changePasswordSchema), authController.changePassword);

module.exports = router;
