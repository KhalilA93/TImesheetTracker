import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchSettings, updateSettings } from '../../store/actions/settingsActions';
import './Settings.css';

const Settings = () => {
  const dispatch = useDispatch();
  const { settings, loading, error } = useSelector(state => state.settings);
  
  const [formData, setFormData] = useState({
    defaultPayRate: 30,
    overtimeThreshold: 8,
    overtimeMultiplier: 1.5,
    timeFormat: '12h',
    colorScheme: {
      regular: '#3174ad',
      overtime: '#dc3545',
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
    },
    // New theme settings
    theme: {
      darkMode: false,
      accentColor: '#007bff'
    }
  });  // Load theme from localStorage on component mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('timesheet-theme');
    if (savedTheme) {
      try {
        const parsedTheme = JSON.parse(savedTheme);
        
        // Apply theme immediately to DOM
        const root = document.documentElement;
        if (parsedTheme.darkMode) {
          root.classList.add('dark-mode');
        } else {
          root.classList.remove('dark-mode');
        }
        if (parsedTheme.accentColor) {
          root.style.setProperty('--accent-color', parsedTheme.accentColor);
        }
        
        // Update form data
        setFormData(prev => ({
          ...prev,
          theme: { ...prev.theme, ...parsedTheme }
        }));
      } catch (error) {
        console.error('Error parsing saved theme:', error);
      }
    }
  }, []);

  useEffect(() => {
    dispatch(fetchSettings());
  }, [dispatch]);  useEffect(() => {
    if (settings) {
      // Get current theme from localStorage to preserve it
      const savedTheme = localStorage.getItem('timesheet-theme');
      let preservedTheme = {
        darkMode: false,
        accentColor: '#007bff'
      };
      
      if (savedTheme) {
        try {
          preservedTheme = JSON.parse(savedTheme);
        } catch (error) {
          console.error('Error parsing saved theme:', error);
        }
      }

      // Settings from Redux already have theme filtered out
      setFormData(prevFormData => ({
        ...prevFormData,
        ...settings,
        // Always preserve theme settings from localStorage
        theme: preservedTheme
      }));
    }
  }, [settings]);// Apply theme changes to document root
  useEffect(() => {
    if (formData.theme && (formData.theme.darkMode !== undefined || formData.theme.accentColor)) {
      const root = document.documentElement;
      
      // Apply dark mode
      if (formData.theme.darkMode) {
        root.classList.add('dark-mode');
      } else {
        root.classList.remove('dark-mode');
      }
      
      // Apply accent color
      if (formData.theme.accentColor) {
        root.style.setProperty('--accent-color', formData.theme.accentColor);
      }
      
      // Save theme to localStorage
      localStorage.setItem('timesheet-theme', JSON.stringify(formData.theme));
    }  }, [formData.theme.darkMode, formData.theme.accentColor]); // Only run when theme values actually change

  // Debug useEffect to track theme changes
  useEffect(() => {
    console.log('Theme changed:', formData.theme);
  }, [formData.theme]);

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
  };  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Theme filtering is now handled in Redux actions
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
            <div className="form-group">
              <label htmlFor="overtimeThreshold">Overtime Threshold (hours)</label>
              <input
                type="number"
                id="overtimeThreshold"
                name="overtimeThreshold"
                value={formData.overtimeThreshold}
                onChange={handleInputChange}
                min="0"
                step="0.5"
                required
              />
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="overtimeMultiplier">Overtime Multiplier</label>
            <input
              type="number"
              id="overtimeMultiplier"
              name="overtimeMultiplier"
              value={formData.overtimeMultiplier}
              onChange={handleInputChange}
              min="1"
              step="0.1"
              required
            />
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
        </section>        {/* Theme Settings */}
        <section className="settings-section theme-settings">
          <h2>🌙 Theme Settings</h2>
          <div className="checkbox-group">
            <label>              <input
                type="checkbox"
                name="theme.darkMode"
                checked={theme.darkMode}
                onChange={(e) => handleThemeChange('darkMode', e.target.checked)}
              />
              Dark mode
              {formData.theme.darkMode && (
                <span className="dark-mode-indicator">
                  🌙 Active
                </span>
              )}
            </label>
          </div>
          <div className="form-group">
            <label htmlFor="theme.accentColor">Accent Color</label>
            <input
              type="color"
              id="theme.accentColor"
              name="theme.accentColor"
              value={formData.theme.accentColor}
              onChange={handleInputChange}
            />
          </div>
          <div className="color-presets">
            <label>Quick Color Presets:</label>
            <div className="preset-colors">
              {['#007bff', '#28a745', '#dc3545', '#ffc107', '#17a2b8', '#6f42c1', '#fd7e14', '#e83e8c'].map(color => (
                <button
                  key={color}
                  type="button"
                  className={`color-preset ${formData.theme.accentColor === color ? 'active' : ''}`}
                  style={{ backgroundColor: color }}
                  onClick={() => setFormData(prev => ({
                    ...prev,
                    theme: { ...prev.theme, accentColor: color }
                  }))}
                  title={`Set accent color to ${color}`}
                />
              ))}
            </div>
          </div>
          <div className="theme-preview">
            <div 
              className="accent-color-preview"
              style={{ backgroundColor: formData.theme.accentColor }}
            ></div>
            <span className="theme-preview-text">
              Current theme: {formData.theme.darkMode ? 'Dark' : 'Light'} mode with accent color
            </span>
          </div>
        </section>        <div className="settings-actions">
          <button type="button" onClick={() => {
            console.log('=== CURRENT STATE DEBUG ===');
            console.log('formData.theme:', formData.theme);
            console.log('localStorage theme:', localStorage.getItem('timesheet-theme'));
            console.log('Redux settings:', settings);
            console.log('Full formData:', formData);
          }} style={{marginRight: '10px', background: '#6c757d'}}>
            Debug State
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
