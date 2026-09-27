const usersService = require('../services/users.service');

async function create(req, res, next) {
  try {
    const user = await usersService.createUser(req.body);
    res.status(201).json(user);
  } catch (err) {
    next(err);
  }
}

async function list(req, res, next) {
  try {
    const { search, page, limit } = req.query;
    const result = await usersService.getUsers({
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
    const user = await usersService.getUserById(req.params.id);
    res.json(user);
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const user = await usersService.updateUser(req.params.id, req.body);
    res.json(user);
  } catch (err) {
    next(err);
  }
}

async function deactivate(req, res, next) {
  try {
    const user = await usersService.deactivateUser(req.params.id);
    res.json(user);
  } catch (err) {
    next(err);
  }
}

async function reactivate(req, res, next) {
  try {
    const user = await usersService.reactivateUser(req.params.id);
    res.json(user);
  } catch (err) {
    next(err);
  }
}

module.exports = { create, list, getOne, update, deactivate, reactivate };
