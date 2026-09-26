const express = require('express');
const patientsController = require('../controllers/patients.controller');
const appointmentsService = require('../services/appointments.service');
const authMiddleware = require('../middlewares/auth.middleware');
const { requireRole } = require('../middlewares/role.middleware');
const { validate } = require('../middlewares/validate.middleware');
const { createPatientSchema, updatePatientSchema } = require('../validators/patients.validator');

const router = express.Router();

// Every patients route requires a logged-in user.
router.use(authMiddleware);

router.post('/', validate(createPatientSchema), patientsController.create);
router.get('/', patientsController.list);

// Must come before /:id so Express doesn't treat "archived" as an :id param.
router.get('/archived', requireRole('admin'), patientsController.listArchived);
router.get('/archived/:id', requireRole('admin'), patientsController.getArchivedOne);
router.patch('/archived/:id/restore', requireRole('admin'), patientsController.restore);

router.get('/:id', patientsController.getOne);
router.get('/:id/appointments', async (req, res, next) => {
  try {
    const appointments = await appointmentsService.getAppointmentsForPatient(req.params.id);
    res.json(appointments);
  } catch (err) {
    next(err);
  }
});
router.put('/:id', validate(updatePatientSchema), patientsController.update);
router.delete('/:id', requireRole('admin'), patientsController.remove);

module.exports = router;
