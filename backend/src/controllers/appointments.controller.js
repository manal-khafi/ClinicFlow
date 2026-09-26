const appointmentsService = require('../services/appointments.service');

async function create(req, res, next) {
  try {
    const appointment = await appointmentsService.createAppointment(req.body, req.user.id);
    res.status(201).json(appointment);
  } catch (err) {
    next(err);
  }
}

async function list(req, res, next) {
  try {
    const { date, status, page, limit } = req.query;
    const result = await appointmentsService.getAppointments({
      date,
      status,
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
    });
    res.json(result);
  } catch (err) {
    next(err);
  }
}

async function getOne(req, res, next) {
  try {
    const appointment = await appointmentsService.getAppointmentById(req.params.id);
    res.json(appointment);
  } catch (err) {
    next(err);
  }
}

async function updateStatus(req, res, next) {
  try {
    const appointment = await appointmentsService.updateStatus(req.params.id, req.body.status);
    res.json(appointment);
  } catch (err) {
    next(err);
  }
}

module.exports = { create, list, getOne, updateStatus };
