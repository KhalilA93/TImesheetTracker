const express = require('express');
const router = express.Router();
const {
  getSettings,
  updateSettings,
  updateSetting,
  getPayRate,
  updatePayRate,
  getNotificationSettings,
  updateNotificationSettings,
  getColorScheme,
  updateColorScheme,
  getOvertimeSettings,
  updateOvertimeSettings,
  calculatePayWithOvertime,
  resetSettings,
  exportSettings,
  importSettings
} = require('../controllers/settingsController');

// Protect all settings routes
const auth = require('../middleware/auth');
router.use(auth);

// GET /api/settings - Get all settings
router.get('/', getSettings);

// PUT /api/settings - Update settings
router.put('/', updateSettings);

// GET /api/settings/pay-rate - Get pay rate settings
router.get('/pay-rate', getPayRate);

// PUT /api/settings/pay-rate - Update pay rate
router.put('/pay-rate', updatePayRate);

// GET /api/settings/notifications - Get notification settings
router.get('/notifications', getNotificationSettings);

// PUT /api/settings/notifications - Update notification settings
router.put('/notifications', updateNotificationSettings);

// GET /api/settings/colors - Get color scheme
router.get('/colors', getColorScheme);

// PUT /api/settings/colors - Update color scheme
router.put('/colors', updateColorScheme);

// GET /api/settings/overtime - Get overtime settings
router.get('/overtime', getOvertimeSettings);

// PUT /api/settings/overtime - Update overtime settings
router.put('/overtime', updateOvertimeSettings);

// POST /api/settings/calculate-pay - Calculate pay with overtime
router.post('/calculate-pay', calculatePayWithOvertime);

// POST /api/settings/reset - Reset settings to defaults
router.post('/reset', resetSettings);

// GET /api/settings/export - Export settings
router.get('/export', exportSettings);

// POST /api/settings/import - Import settings
router.post('/import', importSettings);

// PUT /api/settings/:key - Update specific setting (must be last to avoid conflicts)
router.put('/:key', updateSetting);

module.exports = router;
