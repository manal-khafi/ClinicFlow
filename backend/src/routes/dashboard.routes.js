const express = require('express');
const dashboardController = require('../controllers/dashboard.controller');
const authMiddleware = require('../middlewares/auth.middleware');

const router = express.Router();

// Any logged-in user (not admin-only).
router.get('/stats', authMiddleware, dashboardController.getStats);

module.exports = router;
