const express = require('express');
const appointmentsController = require('../controllers/appointments.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const { validate } = require('../middlewares/validate.middleware');
const { createAppointmentSchema, updateStatusSchema } = require('../validators/appointments.validator');

const router = express.Router();

// Every appointments route requires a logged-in user.
router.use(authMiddleware);

router.post('/', validate(createAppointmentSchema), appointmentsController.create);
router.get('/', appointmentsController.list);
router.get('/:id', appointmentsController.getOne);
router.patch('/:id/status', validate(updateStatusSchema), appointmentsController.updateStatus);

module.exports = router;
