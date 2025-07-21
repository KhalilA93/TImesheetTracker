const express = require('express');
const router = express.Router();
const {
  getAllEntries,
  getCalendarEntries,
  getEntryById,
  createEntry,
  updateEntry,
  deleteEntry,
  getTotals,
  bulkUpdateEntries,
  getProjectSummary
} = require('../controllers/timesheetController');

// Protect all timesheet routes
const auth = require('../middleware/auth');
router.use(auth);

// GET /api/timesheet-entries - Get all entries with filtering
router.get('/', getAllEntries);

// GET /api/timesheet-entries/calendar - Get entries formatted for calendar
router.get('/calendar', getCalendarEntries);

// GET /api/timesheet-entries/totals - Get totals for date range
router.get('/totals', getTotals);

// GET /api/timesheet-entries/projects/summary - Get project summary
router.get('/projects/summary', getProjectSummary);

// GET /api/timesheet-entries/:id - Get single entry
router.get('/:id', getEntryById);

// POST /api/timesheet-entries - Create new entry
router.post('/', createEntry);

// PUT /api/timesheet-entries/:id - Update entry
router.put('/:id', updateEntry);

// DELETE /api/timesheet-entries/:id - Delete entry
router.delete('/:id', deleteEntry);

// PATCH /api/timesheet-entries/bulk - Bulk update entries
router.patch('/bulk', bulkUpdateEntries);

module.exports = router;
