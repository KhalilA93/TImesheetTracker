const express = require('express');
const router = express.Router();
const {
  getDashboardOverview,
  getWeeklySummary,
  getMonthlySummary,
  getProductivityInsights,
  getAlarmStatistics
} = require('../controllers/dashboardController');

// GET /api/dashboard/overview - Get dashboard overview
router.get('/overview', getDashboardOverview);

// GET /api/dashboard - Get dashboard overview (alias for backwards compatibility)
router.get('/', getDashboardOverview);

// GET /api/dashboard/weekly - Get weekly summary
router.get('/weekly', getWeeklySummary);

// GET /api/dashboard/monthly - Get monthly summary
router.get('/monthly', getMonthlySummary);

// GET /api/dashboard/insights - Get productivity insights
router.get('/insights', getProductivityInsights);

// GET /api/dashboard/alarms/stats - Get alarm statistics
router.get('/alarms/stats', getAlarmStatistics);

module.exports = router;
