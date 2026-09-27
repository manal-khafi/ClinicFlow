const dashboardService = require('../services/dashboard.service');

async function getStats(req, res, next) {
  try {
    const stats = await dashboardService.getDashboardStats();
    res.json(stats);
  } catch (err) {
    next(err);
  }
}

module.exports = { getStats };
