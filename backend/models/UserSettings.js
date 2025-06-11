const mongoose = require('mongoose');

const userSettingsSchema = new mongoose.Schema({
  // Pay rate configuration
  defaultPayRate: {
    type: Number,
    required: true,
    min: 0,
    default: 15.00 // Default $15/hour
  },
  currency: {
    type: String,
    default: 'USD',
    enum: ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY']
  },
  currencySymbol: {
    type: String,
    default: '$'
  },
  
  // Time and date preferences
  timeFormat: {
    type: String,
    enum: ['12h', '24h'],
    default: '12h'
  },
  dateFormat: {
    type: String,
    enum: ['MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY-MM-DD'],
    default: 'MM/DD/YYYY'
  },
  weekStartsOn: {
    type: Number,
    min: 0,
    max: 6,
    default: 0 // 0 = Sunday, 1 = Monday, etc.
  },
  timezone: {
    type: String,
    default: 'America/New_York'
  },
  
  // Calendar display preferences
  defaultCalendarView: {
    type: String,
    enum: ['month', 'week', 'day', 'agenda'],
    default: 'week'
  },
  showWeekends: {
    type: Boolean,
    default: true
  },
  businessHoursStart: {
    type: String,
    default: '09:00',
    validate: {
      validator: function(time) {
        return /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(time);
      },
      message: 'Business hours start must be in HH:MM format'
    }
  },
  businessHoursEnd: {
    type: String,
    default: '17:00',
    validate: {
      validator: function(time) {
        return /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(time);
      },
      message: 'Business hours end must be in HH:MM format'
    }
  },
  
  // Work session defaults
  defaultSessionDuration: {
    type: Number,
    default: 8, // 8 hours
    min: 0.25,
    max: 24
  },
  defaultBreakDuration: {
    type: Number,
    default: 1, // 1 hour
    min: 0.25,
    max: 4
  },
  autoCalculateBreaks: {
    type: Boolean,
    default: false
  },
  minimumSessionDuration: {
    type: Number,
    default: 0.25, // 15 minutes
    min: 0.1
  },
  
  // Overtime configuration
  overtimeThreshold: {
    type: Number,
    default: 8, // Hours per day before overtime
    min: 0
  },
  overtimeMultiplier: {
    type: Number,
    default: 1.5, // 1.5x pay for overtime
    min: 1
  },
  weeklyOvertimeThreshold: {
    type: Number,
    default: 40, // Hours per week before overtime
    min: 0
  },
  
  // Notification preferences
  notifications: {
    browserNotifications: {
      type: Boolean,
      default: true
    },
    soundNotifications: {
      type: Boolean,
      default: true
    },
    defaultReminderMinutes: {
      type: Number,
      default: 15,
      min: 0,
      max: 1440
    },
    dailySummaryTime: {
      type: String,
      default: '18:00' // 6 PM
    },
    weeklySummaryDay: {
      type: Number,
      default: 5, // Friday
      min: 0,
      max: 6
    }
  },
  
  // Color scheme and theming
  theme: {
    type: String,
    enum: ['light', 'dark', 'auto'],
    default: 'auto'
  },
  colorScheme: {
    regular: {
      type: String,
      default: '#3174ad'
    },
    overtime: {
      type: String,
      default: '#f39c12'
    },
    holiday: {
      type: String,
      default: '#e74c3c'
    },
    sick: {
      type: String,
      default: '#95a5a6'
    },
    vacation: {
      type: String,
      default: '#2ecc71'
    },
    training: {
      type: String,
      default: '#9b59b6'
    },
    meeting: {
      type: String,
      default: '#34495e'
    }
  },
  
  // Export and reporting preferences
  reportingPreferences: {
    includeBreaks: {
      type: Boolean,
      default: false
    },
    groupByProject: {
      type: Boolean,
      default: true
    },
    showHourlyBreakdown: {
      type: Boolean,
      default: true
    },
    defaultExportFormat: {
      type: String,
      enum: ['pdf', 'csv', 'excel'],
      default: 'pdf'
    }
  },
  
  // User information (optional)
  userInfo: {
    firstName: {
      type: String,
      trim: true
    },
    lastName: {
      type: String,
      trim: true
    },
    email: {
      type: String,
      trim: true,
      lowercase: true
    },
    company: {
      type: String,
      trim: true
    },
    position: {
      type: String,
      trim: true
    }
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

// Pre-save middleware
userSettingsSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Virtual for formatted pay rate
userSettingsSchema.virtual('formattedPayRate').get(function() {
  return `${this.currencySymbol}${this.defaultPayRate.toFixed(2)}`;
});

// Virtual for business hours range
userSettingsSchema.virtual('businessHoursRange').get(function() {
  return `${this.businessHoursStart} - ${this.businessHoursEnd}`;
});

// Static method to get or create settings
userSettingsSchema.statics.getSettings = async function() {
  let settings = await this.findOne();
  if (!settings) {
    settings = new this();
    await settings.save();
  }
  return settings;
};

// Static method to update specific setting
userSettingsSchema.statics.updateSetting = async function(key, value) {
  let settings = await this.getSettings();
  
  // Handle nested keys like 'notifications.browserNotifications'
  const keys = key.split('.');
  let current = settings;
  
  for (let i = 0; i < keys.length - 1; i++) {
    if (!current[keys[i]]) {
      current[keys[i]] = {};
    }
    current = current[keys[i]];
  }
  
  current[keys[keys.length - 1]] = value;
  
  return await settings.save();
};

// Instance method to calculate pay with overtime
userSettingsSchema.methods.calculatePayWithOvertime = function(hoursWorked, payRate = null) {
  const rate = payRate || this.defaultPayRate;
  let totalPay = 0;
  
  if (hoursWorked <= this.overtimeThreshold) {
    totalPay = hoursWorked * rate;
  } else {
    const regularHours = this.overtimeThreshold;
    const overtimeHours = hoursWorked - this.overtimeThreshold;
    const overtimeRate = rate * this.overtimeMultiplier;
    
    totalPay = (regularHours * rate) + (overtimeHours * overtimeRate);
  }
  
  return totalPay;
};

// Instance method to get color for category
userSettingsSchema.methods.getColorForCategory = function(category) {
  return this.colorScheme[category] || this.colorScheme.regular;
};

module.exports = mongoose.model('UserSettings', userSettingsSchema);
