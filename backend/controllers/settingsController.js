const { UserSettings } = require('../models');

// Get user settings (user-specific)
const getSettings = async (req, res) => {
  try {
    const settings = await UserSettings.getSettings(req.user._id);
    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching settings', error: error.message });
  }
};

// Update user settings
const updateSettings = async (req, res) => {
  try {
    const updates = req.body;
    
    let settings = await UserSettings.getSettings(req.user._id);
    
    // Update settings with provided values
    Object.keys(updates).forEach(key => {
      if (updates[key] !== undefined) {
        // Handle nested objects
        if (typeof updates[key] === 'object' && !Array.isArray(updates[key]) && updates[key] !== null) {
          if (!settings[key]) {
            settings[key] = {};
          }
          Object.assign(settings[key], updates[key]);
        } else {
          settings[key] = updates[key];
        }
      }
    });

    await settings.save();

    res.json({
      message: 'Settings updated successfully',
      settings
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        message: 'Validation error', 
        errors: Object.values(error.errors).map(e => e.message)
      });
    }
    res.status(500).json({ message: 'Error updating settings', error: error.message });
  }
};

// Update specific setting
const updateSetting = async (req, res) => {
  try {
    const { key } = req.params;
    const { value } = req.body;

    if (value === undefined) {
      return res.status(400).json({ message: 'Value is required' });
    }

    const settings = await UserSettings.updateSetting(key, value);

    res.json({
      message: `Setting '${key}' updated successfully`,
      settings
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        message: 'Validation error', 
        errors: Object.values(error.errors).map(e => e.message)
      });
    }
    res.status(500).json({ message: 'Error updating setting', error: error.message });
  }
};

// Get pay rate
const getPayRate = async (req, res) => {
  try {
    const settings = await UserSettings.getSettings();
    res.json({
      defaultPayRate: settings.defaultPayRate,
      currency: settings.currency,
      currencySymbol: settings.currencySymbol,
      formattedPayRate: settings.formattedPayRate
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching pay rate', error: error.message });
  }
};

// Update pay rate
const updatePayRate = async (req, res) => {
  try {
    const { payRate } = req.body;

    if (typeof payRate !== 'number' || payRate < 0) {
      return res.status(400).json({ message: 'Valid pay rate is required' });
    }

    const settings = await UserSettings.updateSetting('defaultPayRate', payRate);

    res.json({
      message: 'Pay rate updated successfully',
      defaultPayRate: settings.defaultPayRate,
      formattedPayRate: settings.formattedPayRate
    });
  } catch (error) {
    res.status(500).json({ message: 'Error updating pay rate', error: error.message });
  }
};

// Get notification settings
const getNotificationSettings = async (req, res) => {
  try {
    const settings = await UserSettings.getSettings();
    res.json(settings.notifications);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching notification settings', error: error.message });
  }
};

// Update notification settings
const updateNotificationSettings = async (req, res) => {
  try {
    const notificationUpdates = req.body;
    
    const settings = await UserSettings.getSettings();
    Object.assign(settings.notifications, notificationUpdates);
    
    await settings.save();

    res.json({
      message: 'Notification settings updated successfully',
      notifications: settings.notifications
    });
  } catch (error) {
    res.status(500).json({ message: 'Error updating notification settings', error: error.message });
  }
};

// Get color scheme
const getColorScheme = async (req, res) => {
  try {
    const settings = await UserSettings.getSettings();
    res.json(settings.colorScheme);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching color scheme', error: error.message });
  }
};

// Update color scheme
const updateColorScheme = async (req, res) => {
  try {
    const colorUpdates = req.body;
    
    const settings = await UserSettings.getSettings();
    Object.assign(settings.colorScheme, colorUpdates);
    
    await settings.save();

    res.json({
      message: 'Color scheme updated successfully',
      colorScheme: settings.colorScheme
    });
  } catch (error) {
    res.status(500).json({ message: 'Error updating color scheme', error: error.message });
  }
};

// Get overtime settings
const getOvertimeSettings = async (req, res) => {
  try {
    const settings = await UserSettings.getSettings();
    res.json({
      overtimeThreshold: settings.overtimeThreshold,
      overtimeMultiplier: settings.overtimeMultiplier,
      weeklyOvertimeThreshold: settings.weeklyOvertimeThreshold
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching overtime settings', error: error.message });
  }
};

// Update overtime settings
const updateOvertimeSettings = async (req, res) => {
  try {
    const { overtimeThreshold, overtimeMultiplier, weeklyOvertimeThreshold } = req.body;
    
    const settings = await UserSettings.getSettings();
    
    if (overtimeThreshold !== undefined) settings.overtimeThreshold = overtimeThreshold;
    if (overtimeMultiplier !== undefined) settings.overtimeMultiplier = overtimeMultiplier;
    if (weeklyOvertimeThreshold !== undefined) settings.weeklyOvertimeThreshold = weeklyOvertimeThreshold;
    
    await settings.save();

    res.json({
      message: 'Overtime settings updated successfully',
      overtimeThreshold: settings.overtimeThreshold,
      overtimeMultiplier: settings.overtimeMultiplier,
      weeklyOvertimeThreshold: settings.weeklyOvertimeThreshold
    });
  } catch (error) {
    res.status(500).json({ message: 'Error updating overtime settings', error: error.message });
  }
};

// Calculate pay with overtime
const calculatePayWithOvertime = async (req, res) => {
  try {
    const { hoursWorked, payRate } = req.body;

    if (typeof hoursWorked !== 'number' || hoursWorked < 0) {
      return res.status(400).json({ message: 'Valid hours worked is required' });
    }

    const settings = await UserSettings.getSettings();
    const totalPay = settings.calculatePayWithOvertime(hoursWorked, payRate);

    res.json({
      hoursWorked,
      payRate: payRate || settings.defaultPayRate,
      totalPay,
      overtimeThreshold: settings.overtimeThreshold,
      overtimeMultiplier: settings.overtimeMultiplier
    });
  } catch (error) {
    res.status(500).json({ message: 'Error calculating pay with overtime', error: error.message });
  }
};

// Reset settings to defaults
const resetSettings = async (req, res) => {
  try {
    // Delete existing settings and create new default ones
    await UserSettings.deleteMany({});
    const settings = await UserSettings.getSettings();

    res.json({
      message: 'Settings reset to defaults successfully',
      settings
    });
  } catch (error) {
    res.status(500).json({ message: 'Error resetting settings', error: error.message });
  }
};

// Export settings
const exportSettings = async (req, res) => {
  try {
    const settings = await UserSettings.getSettings();
    
    // Remove MongoDB-specific fields for clean export
    const exportData = settings.toObject();
    delete exportData._id;
    delete exportData.__v;
    delete exportData.createdAt;
    delete exportData.updatedAt;

    res.json({
      exportedAt: new Date().toISOString(),
      settings: exportData
    });
  } catch (error) {
    res.status(500).json({ message: 'Error exporting settings', error: error.message });
  }
};

// Import settings
const importSettings = async (req, res) => {
  try {
    const { settings: importedSettings } = req.body;

    if (!importedSettings || typeof importedSettings !== 'object') {
      return res.status(400).json({ message: 'Valid settings object is required' });
    }

    let settings = await UserSettings.getSettings();
    
    // Merge imported settings with existing ones
    Object.keys(importedSettings).forEach(key => {
      if (importedSettings[key] !== undefined && key !== '_id' && key !== '__v') {
        settings[key] = importedSettings[key];
      }
    });

    await settings.save();

    res.json({
      message: 'Settings imported successfully',
      settings
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        message: 'Invalid settings data', 
        errors: Object.values(error.errors).map(e => e.message)
      });
    }
    res.status(500).json({ message: 'Error importing settings', error: error.message });
  }
};

module.exports = {
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
};
