const mongoose = require('mongoose');

const timesheetEntrySchema = new mongoose.Schema({
  // Owner reference
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  // Date and time information
  date: {
    type: Date,
    required: true,
    index: true
  },
  startTime: {
    type: Date,
    required: true
  },  endTime: {
    type: Date,
    required: true
  },
    // Calculated hours (can be computed from start/end time)
  hoursWorked: {
    type: Number,
    required: true,
    min: 0
  },
  
  // Pay information
  payRateOverride: {
    type: Number,
    min: 0,
    default: null // null means use global pay rate
  },
  calculatedPay: {
    type: Number,
    min: 0,
    default: 0
  },
  
  // Work details
  description: {
    type: String,
    trim: true,
    maxlength: 500
  },
  project: {
    type: String,
    trim: true,
    maxlength: 100
  },
  category: {
    type: String,
    enum: ['regular', 'overtime', 'holiday', 'sick', 'vacation', 'training', 'meeting'],
    default: 'regular'
  },
  
  // Status and metadata
  status: {
    type: String,
    enum: ['draft', 'confirmed', 'submitted', 'approved'],
    default: 'confirmed'
  },
  isBreakTime: {
    type: Boolean,
    default: false
  },
  
  // Calendar display properties
  color: {
    type: String,
    default: '#3174ad' // Default blue color for calendar events
  },
  
  // Tracking information
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
timesheetEntrySchema.index({ date: 1, startTime: 1 });
timesheetEntrySchema.index({ status: 1 });
timesheetEntrySchema.index({ project: 1 });
timesheetEntrySchema.index({ category: 1 });

// Virtual for formatted date range
timesheetEntrySchema.virtual('timeRange').get(function() {
  const start = this.startTime.toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit' 
  });
  const end = this.endTime.toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit' 
  });
  return `${start} - ${end}`;
});

// Virtual for calendar event title
timesheetEntrySchema.virtual('title').get(function() {
  const hours = this.hoursWorked.toFixed(2);
  const pay = this.calculatedPay.toFixed(2);
  return `${hours}h - $${pay}${this.project ? ` (${this.project})` : ''}`;
});

// Pre-save middleware to update calculatedPay and timestamp
timesheetEntrySchema.pre('save', async function(next) {
  this.updatedAt = new Date();
  
  // Validate end time is after start time
  if (this.startTime && this.endTime && this.endTime <= this.startTime) {
    return next(new Error('End time must be after start time'));
  }
    // If times are modified, recalculate hours worked
  if (this.isModified('startTime') || this.isModified('endTime')) {
    if (this.startTime && this.endTime) {
      this.hoursWorked = (this.endTime - this.startTime) / (1000 * 60 * 60);
      // Force pay recalculation when times change
      this.calculatedPay = 0;
    }
  }
  
  // Calculate hours worked from time difference if not provided or if it's a new document
  if ((!this.hoursWorked || this.isNew) && this.startTime && this.endTime) {
    this.hoursWorked = (this.endTime - this.startTime) / (1000 * 60 * 60);
  }
    // Calculate pay if not already set or if relevant fields are modified
  if (this.isModified('hoursWorked') || this.isModified('payRateOverride') || !this.calculatedPay || this.isNew) {
    let payRate = this.payRateOverride;
    
    // If no override, get global pay rate
    if (!payRate) {
      const UserSettings = mongoose.model('UserSettings');
      const settings = await UserSettings.findOne() || {};
      payRate = settings.defaultPayRate || 0;
    }
    
    this.calculatedPay = this.hoursWorked * payRate;
  }
  
  next();
});

// Static method to get entries for date range
timesheetEntrySchema.statics.getEntriesForDateRange = function(startDate, endDate) {
  return this.find({
    date: {
      $gte: startDate,
      $lte: endDate
    }
  }).sort({ date: 1, startTime: 1 });
};

// Static method to calculate total hours and pay for date range
timesheetEntrySchema.statics.getTotalsForDateRange = async function(startDate, endDate, userId = null) {
  const matchFilter = {
    date: { $gte: startDate, $lte: endDate },
    status: { $in: ['confirmed', 'submitted', 'approved'] }
  };
  
  // Add user filter if userId is provided
  if (userId) {
    matchFilter.owner = userId;
  }
  
  const result = await this.aggregate([
    {
      $match: matchFilter
    },
    {
      $group: {
        _id: null,
        totalHours: { $sum: '$hoursWorked' },
        totalPay: { $sum: '$calculatedPay' },
        entryCount: { $sum: 1 }
      }
    }
  ]);
  
  return result[0] || { totalHours: 0, totalPay: 0, entryCount: 0 };
};

module.exports = mongoose.model('TimesheetEntry', timesheetEntrySchema);
