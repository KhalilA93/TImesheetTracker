const { UserSettings } = require('../models');
const { forceRecalculateUserEarnings } = require('./dashboardController');

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
    
    // Check if pay rate is being updated
    const payRateChanged = updates.defaultPayRate !== undefined && 
                          updates.defaultPayRate !== settings.defaultPayRate;
    
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

    let recalculationInfo = null;
    // If pay rate was changed, force recalculation of timesheet entries
    if (payRateChanged) {
      const recalculatedCount = await forceRecalculateUserEarnings(req.user._id);
      recalculationInfo = {
        entriesRecalculated: recalculatedCount,
        message: `${recalculatedCount} timesheet entries were recalculated with the new pay rate`
      };
    }

    res.json({
      message: 'Settings updated successfully',
      settings,
      ...(recalculationInfo && { recalculationInfo })
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

    const settings = await UserSettings.updateSetting(req.user._id, 'defaultPayRate', payRate);

    // Force recalculation of all timesheet entries since pay rate changed
    const recalculatedCount = await forceRecalculateUserEarnings(req.user._id);

    res.json({
      message: 'Pay rate updated successfully',
      defaultPayRate: settings.defaultPayRate,
      formattedPayRate: settings.formattedPayRate,
      recalculationInfo: {
        entriesRecalculated: recalculatedCount,
        message: `${recalculatedCount} timesheet entries were recalculated with the new pay rate`
      }
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
  resetSettings,
  exportSettings,
  importSettings
};
