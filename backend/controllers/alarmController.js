const { Alarm, TimesheetEntry } = require('../models');

// Get all alarms with optional filtering
const getAllAlarms = async (req, res) => {
  try {
    const {
      status,
      type,
      timesheetEntryId,
      upcoming = false,
      hoursAhead = 24
    } = req.query;

    let query = Alarm.find();

    // Apply filters
    if (status) {
      query = query.where('status').equals(status);
    }
    
    if (type) {
      query = query.where('type').equals(type);
    }
    
    if (timesheetEntryId) {
      query = query.where('timesheetEntryId').equals(timesheetEntryId);
    }

    // Handle upcoming alarms
    if (upcoming === 'true') {
      const now = new Date();
      const futureTime = new Date(now.getTime() + (parseInt(hoursAhead) * 60 * 60 * 1000));
      query = query.where('alarmTime').gte(now).lte(futureTime);
    }

    const alarms = await query
      .populate('timesheetEntryId', 'date startTime endTime project description')
      .sort({ alarmTime: 1 });

    res.json({ alarms });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching alarms', error: error.message });
  }
};

// Get triggerable alarms (should fire now)
const getTriggerableAlarms = async (req, res) => {
  try {
    const alarms = await Alarm.getTriggerable();
    res.json({ alarms });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching triggerable alarms', error: error.message });
  }
};

// Get upcoming alarms
const getUpcomingAlarms = async (req, res) => {
  try {
    const { hoursAhead = 24 } = req.query;
    const alarms = await Alarm.getUpcoming(parseInt(hoursAhead));
    res.json({ alarms });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching upcoming alarms', error: error.message });
  }
};

// Get single alarm by ID
const getAlarmById = async (req, res) => {
  try {
    const alarm = await Alarm.findById(req.params.id)
      .populate('timesheetEntryId');
    
    if (!alarm) {
      return res.status(404).json({ message: 'Alarm not found' });
    }

    res.json(alarm);
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid alarm ID format' });
    }
    res.status(500).json({ message: 'Error fetching alarm', error: error.message });
  }
};

// Create new alarm
const createAlarm = async (req, res) => {
  try {
    const {
      timesheetEntryId,
      reminderMinutes = 15,
      type = 'start-reminder',
      title,
      message,
      soundEnabled = true,
      browserNotification = true
    } = req.body;

    // Validate timesheet entry exists
    const timesheetEntry = await TimesheetEntry.findById(timesheetEntryId);
    if (!timesheetEntry) {
      return res.status(404).json({ message: 'Timesheet entry not found' });
    }

    // Calculate alarm time based on type and reminder minutes
    let alarmTime;
    switch (type) {
      case 'start-reminder':
        alarmTime = new Date(timesheetEntry.startTime.getTime() - (reminderMinutes * 60 * 1000));
        break;
      case 'end-reminder':
        alarmTime = new Date(timesheetEntry.endTime.getTime() - (reminderMinutes * 60 * 1000));
        break;
      default:
        alarmTime = new Date(timesheetEntry.startTime.getTime() - (reminderMinutes * 60 * 1000));
    }

    const alarm = new Alarm({
      timesheetEntryId,
      alarmTime,
      reminderMinutes,
      type,
      title,
      message,
      soundEnabled,
      browserNotification
    });

    await alarm.save();

    // Populate the timesheet entry for response
    await alarm.populate('timesheetEntryId');

    res.status(201).json({
      message: 'Alarm created successfully',
      alarm
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        message: 'Validation error', 
        errors: Object.values(error.errors).map(e => e.message)
      });
    }
    res.status(500).json({ message: 'Error creating alarm', error: error.message });
  }
};

// Update alarm
const updateAlarm = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // If updating reminder minutes or type, recalculate alarm time
    if (updates.reminderMinutes || updates.type) {
      const alarm = await Alarm.findById(id).populate('timesheetEntryId');
      if (!alarm) {
        return res.status(404).json({ message: 'Alarm not found' });
      }

      const reminderMinutes = updates.reminderMinutes || alarm.reminderMinutes;
      const type = updates.type || alarm.type;

      let alarmTime;
      switch (type) {
        case 'start-reminder':
          alarmTime = new Date(alarm.timesheetEntryId.startTime.getTime() - (reminderMinutes * 60 * 1000));
          break;
        case 'end-reminder':
          alarmTime = new Date(alarm.timesheetEntryId.endTime.getTime() - (reminderMinutes * 60 * 1000));
          break;
        default:
          alarmTime = new Date(alarm.timesheetEntryId.startTime.getTime() - (reminderMinutes * 60 * 1000));
      }

      updates.alarmTime = alarmTime;
    }

    const alarm = await Alarm.findByIdAndUpdate(
      id,
      updates,
      { new: true, runValidators: true }
    ).populate('timesheetEntryId');

    if (!alarm) {
      return res.status(404).json({ message: 'Alarm not found' });
    }

    res.json({
      message: 'Alarm updated successfully',
      alarm
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid alarm ID format' });
    }
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        message: 'Validation error', 
        errors: Object.values(error.errors).map(e => e.message)
      });
    }
    res.status(500).json({ message: 'Error updating alarm', error: error.message });
  }
};

// Delete alarm
const deleteAlarm = async (req, res) => {
  try {
    const { id } = req.params;

    const alarm = await Alarm.findByIdAndDelete(id);

    if (!alarm) {
      return res.status(404).json({ message: 'Alarm not found' });
    }

    res.json({
      message: 'Alarm deleted successfully'
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid alarm ID format' });
    }
    res.status(500).json({ message: 'Error deleting alarm', error: error.message });
  }
};

// Trigger alarm (mark as triggered)
const triggerAlarm = async (req, res) => {
  try {
    const { id } = req.params;

    const alarm = await Alarm.findById(id);
    if (!alarm) {
      return res.status(404).json({ message: 'Alarm not found' });
    }

    await alarm.trigger();

    res.json({
      message: 'Alarm triggered successfully',
      alarm
    });
  } catch (error) {
    res.status(500).json({ message: 'Error triggering alarm', error: error.message });
  }
};

// Dismiss alarm
const dismissAlarm = async (req, res) => {
  try {
    const { id } = req.params;

    const alarm = await Alarm.findById(id);
    if (!alarm) {
      return res.status(404).json({ message: 'Alarm not found' });
    }

    await alarm.dismiss();

    res.json({
      message: 'Alarm dismissed successfully',
      alarm
    });
  } catch (error) {
    res.status(500).json({ message: 'Error dismissing alarm', error: error.message });
  }
};

// Snooze alarm
const snoozeAlarm = async (req, res) => {
  try {
    const { id } = req.params;
    const { minutes = 5 } = req.body;

    const alarm = await Alarm.findById(id);
    if (!alarm) {
      return res.status(404).json({ message: 'Alarm not found' });
    }

    await alarm.snooze(minutes);

    res.json({
      message: `Alarm snoozed for ${minutes} minutes`,
      alarm
    });
  } catch (error) {
    res.status(500).json({ message: 'Error snoozing alarm', error: error.message });
  }
};

// Bulk operations for alarms
const bulkDismissAlarms = async (req, res) => {
  try {
    const { alarmIds } = req.body;

    if (!alarmIds || !Array.isArray(alarmIds)) {
      return res.status(400).json({ message: 'Alarm IDs array is required' });
    }

    const result = await Alarm.updateMany(
      { _id: { $in: alarmIds }, status: { $ne: 'dismissed' } },
      { 
        status: 'dismissed', 
        dismissedAt: new Date(),
        snoozeUntil: null,
        snoozeCount: 0
      }
    );

    res.json({
      message: 'Bulk dismiss completed',
      modifiedCount: result.modifiedCount
    });
  } catch (error) {
    res.status(500).json({ message: 'Error performing bulk dismiss', error: error.message });
  }
};

// Get alarms for specific timesheet entry
const getAlarmsForEntry = async (req, res) => {
  try {
    const { timesheetEntryId } = req.params;

    const alarms = await Alarm.find({ timesheetEntryId })
      .sort({ alarmTime: 1 });

    res.json({ alarms });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching alarms for entry', error: error.message });
  }
};

module.exports = {
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
};
