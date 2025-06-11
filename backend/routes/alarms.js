const express = require('express');
const router = express.Router();
const {
  getAllAlarms,
  getTriggerableAlarms,
  getUpcomingAlarms,
  getAlarmById,
  createAlarm,
  updateAlarm,
  deleteAlarm,
  triggerAlarm,
  dismissAlarm,
  snoozeAlarm,
  bulkDismissAlarms,
  getAlarmsForEntry
} = require('../controllers/alarmController');

// GET /api/alarms - Get all alarms with filtering
router.get('/', getAllAlarms);

// GET /api/alarms/triggerable - Get alarms that should trigger now
router.get('/triggerable', getTriggerableAlarms);

// GET /api/alarms/upcoming - Get upcoming alarms
router.get('/upcoming', getUpcomingAlarms);

// GET /api/alarms/entry/:timesheetEntryId - Get alarms for specific timesheet entry
router.get('/entry/:timesheetEntryId', getAlarmsForEntry);

// GET /api/alarms/:id - Get single alarm
router.get('/:id', getAlarmById);

// POST /api/alarms - Create new alarm
router.post('/', createAlarm);

// PUT /api/alarms/:id - Update alarm
router.put('/:id', updateAlarm);

// DELETE /api/alarms/:id - Delete alarm
router.delete('/:id', deleteAlarm);

// POST /api/alarms/:id/trigger - Trigger alarm
router.post('/:id/trigger', triggerAlarm);

// POST /api/alarms/:id/dismiss - Dismiss alarm
router.post('/:id/dismiss', dismissAlarm);

// POST /api/alarms/:id/snooze - Snooze alarm
router.post('/:id/snooze', snoozeAlarm);

// PATCH /api/alarms/bulk/dismiss - Bulk dismiss alarms
router.patch('/bulk/dismiss', bulkDismissAlarms);

module.exports = router;
