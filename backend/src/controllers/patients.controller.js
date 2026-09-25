const patientsService = require('../services/patients.service');

async function create(req, res, next) {
  try {
    const patient = await patientsService.createPatient(req.body);
    res.status(201).json(patient);
  } catch (err) {
    next(err);
  }
}

async function list(req, res, next) {
  try {
    const { search, page, limit } = req.query;
    const result = await patientsService.getPatients({
      search,
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
    const patient = await patientsService.getPatientById(req.params.id);
    res.json(patient);
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const patient = await patientsService.updatePatient(req.params.id, req.body);
    res.json(patient);
  } catch (err) {
    next(err);
  }
}

async function remove(req, res, next) {
  try {
    await patientsService.deletePatient(req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

module.exports = { create, list, getOne, update, remove };
