const mongoose = require('mongoose');

const alarmSchema = new mongoose.Schema({  // Link to timesheet entry (optional for custom alarms)
  timesheetEntryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TimesheetEntry',
    required: false,
    default: null
    // Removed index: true to avoid duplicate with schema.index below
  },
  
  // Alarm timing
  alarmTime: {
    type: Date,
    required: true,
    index: true
  },
  reminderMinutes: {
    type: Number,
    required: true,
    min: 0,
    max: 1440, // Max 24 hours in advance
    default: 15 // 15 minutes before by default
  },
  
  // Alarm configuration
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  message: {
    type: String,
    trim: true,
    maxlength: 500,
    default: 'Time to start your work session!'
  },
  
  // Alarm type and behavior
  type: {
    type: String,
    enum: ['start-reminder', 'end-reminder', 'break-reminder', 'custom'],
    default: 'start-reminder'
  },
  isRecurring: {
    type: Boolean,
    default: false
  },
  recurringPattern: {
    type: String,
    enum: ['daily', 'weekly', 'monthly', null],
    default: null
  },
  
  // Sound and notification settings
  soundEnabled: {
    type: Boolean,
    default: true
  },
  soundFile: {
    type: String,
    default: 'default' // Could be 'default', 'chime', 'bell', etc.
  },
  browserNotification: {
    type: Boolean,
    default: true
  },
  
  // Status tracking
  status: {
    type: String,
    enum: ['active', 'triggered', 'dismissed', 'snoozed', 'disabled'],
    default: 'active'
  },
  triggeredAt: {
    type: Date,
    default: null
  },
  dismissedAt: {
    type: Date,
    default: null
  },
  snoozeUntil: {
    type: Date,
    default: null
  },
  snoozeCount: {
    type: Number,
    default: 0,
    min: 0
  },
  
  // Metadata
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for efficient querying
alarmSchema.index({ alarmTime: 1, status: 1 });
alarmSchema.index({ timesheetEntryId: 1 });
alarmSchema.index({ status: 1 });

// Virtual for checking if alarm should trigger
alarmSchema.virtual('shouldTrigger').get(function() {
  const now = new Date();
  const triggerTime = this.snoozeUntil || this.alarmTime;
  return this.status === 'active' && now >= triggerTime;
});

// Virtual for time until alarm
alarmSchema.virtual('timeUntilAlarm').get(function() {
  const now = new Date();
  const triggerTime = this.snoozeUntil || this.alarmTime;
  return Math.max(0, triggerTime - now);
});

// Pre-save middleware
alarmSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  
  // Auto-generate title if not provided
  if (!this.title && this.timesheetEntryId) {
    switch (this.type) {
      case 'start-reminder':
        this.title = 'Work Session Starting Soon';
        break;
      case 'end-reminder':
        this.title = 'Work Session Ending Soon';
        break;
      case 'break-reminder':
        this.title = 'Break Time Reminder';
        break;
      default:
        this.title = 'Work Reminder';
    }
  }
  
  next();
});

// Static method to get active alarms that should trigger
alarmSchema.statics.getTriggerable = function() {
  const now = new Date();
  return this.find({
    status: 'active',
    $or: [
      { alarmTime: { $lte: now }, snoozeUntil: null },
      { snoozeUntil: { $lte: now } }
    ]
  }).populate('timesheetEntryId');
};

// Static method to get upcoming alarms
alarmSchema.statics.getUpcoming = function(hoursAhead = 24) {
  const now = new Date();
  const futureTime = new Date(now.getTime() + (hoursAhead * 60 * 60 * 1000));
  
  return this.find({
    status: 'active',
    alarmTime: { $gte: now, $lte: futureTime }
  }).populate('timesheetEntryId').sort({ alarmTime: 1 });
};

// Instance method to trigger alarm
alarmSchema.methods.trigger = function() {
  this.status = 'triggered';
  this.triggeredAt = new Date();
  return this.save();
};

// Instance method to dismiss alarm
alarmSchema.methods.dismiss = function() {
  this.status = 'dismissed';
  this.dismissedAt = new Date();
  this.snoozeUntil = null;
  this.snoozeCount = 0;
  return this.save();
};

// Instance method to snooze alarm
alarmSchema.methods.snooze = function(minutes = 5) {
  const now = new Date();
  this.snoozeUntil = new Date(now.getTime() + (minutes * 60 * 1000));
  this.snoozeCount += 1;
  this.status = 'snoozed';
  return this.save();
};

// Instance method to reactivate snoozed alarm
alarmSchema.methods.reactivate = function() {
  if (this.status === 'snoozed') {
    this.status = 'active';
    this.snoozeUntil = null;
  }
  return this.save();
};

module.exports = mongoose.model('Alarm', alarmSchema);
