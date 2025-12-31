const express = require('express');
const { adminController } = require('../controllers');
const { authenticate, validate } = require('../middleware');
const { createAdminSchema, updateAdminSchema, adminIdSchema } = require('../validators');

const router = express.Router();

// All routes require authentication
router.use(authenticate);

router.get('/', adminController.getAll);
router.post('/', validate(createAdminSchema), adminController.create);
router.put('/:id', validate(updateAdminSchema), adminController.update);
router.delete('/:id', validate(adminIdSchema), adminController.remove);

module.exports = router;
