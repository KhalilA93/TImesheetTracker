import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchSettings, updateSettings } from '../../store/actions/settingsActions';
import { ThemeManager } from '../../utils/themeManager';
import './Settings.css';

const Settings = () => {
  const dispatch = useDispatch();
  const { settings, loading, error } = useSelector(state => state.settings);
    // Separate state for theme (client-side only)
  const [themeData, setThemeData] = useState(ThemeManager.defaultTheme);
  
  // State for other settings (backend)
  const [formData, setFormData] = useState({
    defaultPayRate: 30,
    timeFormat: '12h',
    colorScheme: {
      regular: '#3174ad',
      holiday: '#28a745',
      sick: '#ffc107',
      vacation: '#17a2b8',
      training: '#6f42c1',
      meeting: '#fd7e14'
    },
    notifications: {
      enabled: true,
      sound: true,
      desktop: true
    }
  });
  // Load theme on component mount
  useEffect(() => {
    const loadedTheme = ThemeManager.loadTheme();
    setThemeData(loadedTheme);
    ThemeManager.applyTheme(loadedTheme);
  }, []);

  // Load backend settings
  useEffect(() => {
    dispatch(fetchSettings());
  }, [dispatch]);

  // Update formData when backend settings load (excluding theme)
  useEffect(() => {
    if (settings) {
      // Remove theme from backend settings if it exists
      const { theme, ...otherSettings } = settings;
      setFormData(prev => ({
        ...prev,
        ...otherSettings
      }));
    }
  }, [settings]);

  // Handle theme changes
  const handleThemeChange = (property, value) => {
    const newTheme = { ...themeData, [property]: value };
    setThemeData(newTheme);
    ThemeManager.saveTheme(newTheme);
    ThemeManager.applyTheme(newTheme);
  };

  // Handle regular form input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: type === 'checkbox' ? checked : value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : (type === 'number' ? parseFloat(value) : value)
      }));
    }
  };

  // Handle form submission (backend settings only)
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await dispatch(updateSettings(formData));
      alert('Settings updated successfully!');
    } catch (error) {
      console.error('Error updating settings:', error);
      alert('Error updating settings. Please try again.');
    }
  };

  if (loading) {
    return <div className="loading-spinner">Loading settings...</div>;
  }

  if (error) {
    return <div className="error-message">Error: {error}</div>;
  }

  return (
    <div className="settings-container">
      <div className="settings-header">
        <h1>Settings</h1>
        <p>Configure your timesheet preferences</p>
      </div>

      <form onSubmit={handleSubmit} className="settings-form">
        {/* Pay Settings */}
        <section className="settings-section">
          <h2>💰 Pay Settings</h2>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="defaultPayRate">Default Pay Rate ($/hour)</label>
              <input
                type="number"
                id="defaultPayRate"
                name="defaultPayRate"
                value={formData.defaultPayRate}
                onChange={handleInputChange}
                min="0"
                step="0.01"
                required
              />
            </div>
          </div>
        </section>

        {/* Display Settings */}
        <section className="settings-section">
          <h2>🎨 Display Settings</h2>
          <div className="form-group">
            <label htmlFor="timeFormat">Time Format</label>
            <select
              id="timeFormat"
              name="timeFormat"
              value={formData.timeFormat}
              onChange={handleInputChange}
            >
              <option value="12h">12-hour (AM/PM)</option>
              <option value="24h">24-hour</option>
            </select>
          </div>
        </section>

        {/* Color Scheme */}
        <section className="settings-section">
          <h2>🌈 Category Colors</h2>
          <div className="color-grid">
            {Object.entries(formData.colorScheme).map(([category, color]) => (
              <div key={category} className="color-item">
                <label htmlFor={`colorScheme.${category}`}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </label>
                <input
                  type="color"
                  id={`colorScheme.${category}`}
                  name={`colorScheme.${category}`}
                  value={color}
                  onChange={handleInputChange}
                />
              </div>
            ))}
          </div>
        </section>

        {/* Notification Settings */}
        <section className="settings-section">
          <h2>🔔 Notifications</h2>
          <div className="checkbox-group">
            <label>
              <input
                type="checkbox"
                name="notifications.enabled"
                checked={formData.notifications.enabled}
                onChange={handleInputChange}
              />
              Enable notifications
            </label>
          </div>
          <div className="checkbox-group">
            <label>
              <input
                type="checkbox"
                name="notifications.sound"
                checked={formData.notifications.sound}
                onChange={handleInputChange}
                disabled={!formData.notifications.enabled}
              />
              Play sound
            </label>
          </div>
          <div className="checkbox-group">
            <label>
              <input
                type="checkbox"
                name="notifications.desktop"
                checked={formData.notifications.desktop}
                onChange={handleInputChange}
                disabled={!formData.notifications.enabled}
              />
              Desktop notifications
            </label>
          </div>
        </section>

        {/* Theme Settings */}
        <section className="settings-section theme-settings">
          <h2>🌙 Theme Settings</h2>
          <div className="checkbox-group">
            <label>
              <input
                type="checkbox"
                checked={themeData.darkMode}
                onChange={(e) => handleThemeChange('darkMode', e.target.checked)}
              />
              Dark mode
              {themeData.darkMode && (
                <span className="dark-mode-indicator">
                  🌙 Active
                </span>
              )}
            </label>
          </div>
          <div className="form-group">
            <label htmlFor="accentColor">Accent Color</label>
            <input
              type="color"
              id="accentColor"
              value={themeData.accentColor}
              onChange={(e) => handleThemeChange('accentColor', e.target.value)}
            />
          </div>
          <div className="color-presets">
            <label>Quick Color Presets:</label>
            <div className="preset-colors">
              {['#007bff', '#28a745', '#dc3545', '#ffc107', '#17a2b8', '#6f42c1', '#fd7e14', '#e83e8c'].map(color => (
                <button
                  key={color}
                  type="button"
                  className={`color-preset ${themeData.accentColor === color ? 'active' : ''}`}
                  style={{ backgroundColor: color }}
                  onClick={() => handleThemeChange('accentColor', color)}
                  title={`Set accent color to ${color}`}
                />
              ))}
            </div>
          </div>
          <div className="theme-preview">
            <div 
              className="accent-color-preview"
              style={{ backgroundColor: themeData.accentColor }}
            ></div>
            <span className="theme-preview-text">
              Current theme: {themeData.darkMode ? 'Dark' : 'Light'} mode with accent color
            </span>
          </div>
        </section>

        <div className="settings-actions">
          <button type="button" onClick={() => {
            console.log('=== THEME DEBUG ===');
            console.log('themeData:', themeData);
            console.log('localStorage:', localStorage.getItem('timesheet-theme'));
            console.log('formData (no theme):', formData);
          }} style={{marginRight: '10px', background: '#6c757d', color: 'white', padding: '10px 20px', borderRadius: '8px'}}>
            Debug Theme
          </button>
          <button type="submit" className="save-settings-btn">
            Save Settings
          </button>
        </div>
      </form>
    </div>
  );
};

export default Settings;
