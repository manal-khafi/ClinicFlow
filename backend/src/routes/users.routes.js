const express = require('express');
const usersController = require('../controllers/users.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const { requireRole } = require('../middlewares/role.middleware');
const { validate } = require('../middlewares/validate.middleware');
const { createUserSchema, updateUserSchema } = require('../validators/users.validator');

const router = express.Router();

// This entire resource is admin-only.
router.use(authMiddleware, requireRole('admin'));

router.post('/', validate(createUserSchema), usersController.create);
router.get('/', usersController.list);
router.get('/:id', usersController.getOne);
router.put('/:id', validate(updateUserSchema), usersController.update);
router.patch('/:id/deactivate', usersController.deactivate);
router.patch('/:id/reactivate', usersController.reactivate);

module.exports = router;
