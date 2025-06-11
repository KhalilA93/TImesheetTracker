const express = require('express');
const router = express.Router();

// Import all route modules
const timesheetEntries = require('./timesheetEntries');
const alarms = require('./alarms');
const settings = require('./settings');
const dashboard = require('./dashboard');

// Mount routes
router.use('/timesheet-entries', timesheetEntries);
router.use('/alarms', alarms);
router.use('/settings', settings);
router.use('/dashboard', dashboard);

// API documentation route
router.get('/', (req, res) => {
  res.json({
    message: 'Timesheet Tracker API',
    version: '1.0.0',
    endpoints: {
      timesheetEntries: '/api/timesheet-entries',
      alarms: '/api/alarms',
      settings: '/api/settings',
      dashboard: '/api/dashboard'
    },
    documentation: {
      timesheetEntries: {
        'GET /': 'Get all entries with filtering',
        'GET /calendar': 'Get entries formatted for calendar',
        'GET /totals': 'Get totals for date range',
        'GET /projects/summary': 'Get project summary',
        'GET /:id': 'Get single entry',
        'POST /': 'Create new entry',
        'PUT /:id': 'Update entry',
        'DELETE /:id': 'Delete entry',
        'PATCH /bulk': 'Bulk update entries'
      },
      alarms: {
        'GET /': 'Get all alarms with filtering',
        'GET /triggerable': 'Get alarms that should trigger now',
        'GET /upcoming': 'Get upcoming alarms',
        'GET /entry/:timesheetEntryId': 'Get alarms for specific timesheet entry',
        'GET /:id': 'Get single alarm',
        'POST /': 'Create new alarm',
        'PUT /:id': 'Update alarm',
        'DELETE /:id': 'Delete alarm',
        'POST /:id/trigger': 'Trigger alarm',
        'POST /:id/dismiss': 'Dismiss alarm',
        'POST /:id/snooze': 'Snooze alarm',
        'PATCH /bulk/dismiss': 'Bulk dismiss alarms'
      },
      settings: {
        'GET /': 'Get all settings',
        'PUT /': 'Update settings',
        'PUT /:key': 'Update specific setting',
        'GET /pay-rate': 'Get pay rate settings',
        'PUT /pay-rate': 'Update pay rate',
        'GET /notifications': 'Get notification settings',
        'PUT /notifications': 'Update notification settings',
        'GET /colors': 'Get color scheme',
        'PUT /colors': 'Update color scheme',
        'GET /overtime': 'Get overtime settings',
        'PUT /overtime': 'Update overtime settings',
        'POST /calculate-pay': 'Calculate pay with overtime',
        'POST /reset': 'Reset settings to defaults',
        'GET /export': 'Export settings',
        'POST /import': 'Import settings'
      },
      dashboard: {
        'GET /': 'Get dashboard overview',
        'GET /weekly': 'Get weekly summary',
        'GET /monthly': 'Get monthly summary',
        'GET /insights': 'Get productivity insights',
        'GET /alarms/stats': 'Get alarm statistics'
      }
    }
  });
});

module.exports = router;
