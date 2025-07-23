// Theme management utility
export class ThemeManager {
  static STORAGE_KEY = 'timesheet-theme';
  
  static defaultTheme = {
    darkMode: false,
    accentColor: '#007bff'
  };

  // Get user-specific storage key
  static getUserStorageKey(userId) {
    return userId ? `${this.STORAGE_KEY}-${userId}` : this.STORAGE_KEY;
  }

  // Load theme from localStorage (for immediate loading) and merge with backend theme
  static loadTheme(backendTheme = null, userId = null) {
    try {
      let theme = { ...this.defaultTheme };
      
      // Use user-specific key if userId provided
      const storageKey = this.getUserStorageKey(userId);
      
      // First, try localStorage for immediate loading
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        theme = { ...theme, ...parsed };
      }
      
      // Then merge backend theme if provided (user-specific settings)
      if (backendTheme && typeof backendTheme === 'object') {
        theme = { ...theme, ...backendTheme };
        // Also update localStorage to sync (with user-specific key)
        this.saveTheme(theme, userId);
      }
      
      return theme;
    } catch (error) {
      console.error('Error loading theme:', error);
      return this.defaultTheme;
    }
  }

  // Save theme to localStorage with user-specific key
  static saveTheme(theme, userId = null) {
    try {
      const storageKey = this.getUserStorageKey(userId);
      localStorage.setItem(storageKey, JSON.stringify(theme));
      return true;
    } catch (error) {
      console.error('Error saving theme:', error);
      return false;
    }
  }

  // Clear theme data for user logout
  static clearUserTheme(userId = null) {
    try {
      const storageKey = this.getUserStorageKey(userId);
      localStorage.removeItem(storageKey);
      
      // Also clear the generic key to prevent cross-contamination
      localStorage.removeItem(this.STORAGE_KEY);
      
      return true;
    } catch (error) {
      console.error('Error clearing theme:', error);
      return false;
    }
  }

  // Save theme to user account (backend)
  static async saveThemeToAccount(theme, apiService) {
    try {
      if (apiService && apiService.settingsApi) {
        // Update user settings with theme data
        await apiService.settingsApi.updateSettings({ theme });
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error saving theme to account:', error);
      return false;
    }
  }

  // Apply theme to DOM
  static applyTheme(theme) {
    const root = document.documentElement;
    
    // Apply dark mode
    if (theme.darkMode) {
      root.classList.add('dark-mode');
    } else {
      root.classList.remove('dark-mode');
    }
    
    // Apply accent color
    if (theme.accentColor) {
      root.style.setProperty('--accent-color', theme.accentColor);
    }
  }

  // Initialize theme on app startup (use defaults, wait for user login for personalization)
  static initialize() {
    const theme = this.loadTheme(); // Load generic theme initially
    this.applyTheme(theme);
    return theme;
  }

  // Initialize theme for specific user (called after login)
  static initializeForUser(userId, backendTheme = null) {
    const theme = this.loadTheme(backendTheme, userId);
    this.applyTheme(theme);
    return theme;
  }

  // Update theme (save and apply) with user context
  static updateTheme(newTheme, userId = null) {
    const theme = { ...this.defaultTheme, ...newTheme };
    this.saveTheme(theme, userId);
    this.applyTheme(theme);
    return theme;
  }

  // Reset theme to defaults and clear user-specific data
  static resetTheme(userId = null) {
    this.clearUserTheme(userId);
    this.applyTheme(this.defaultTheme);
    return this.defaultTheme;
  }
}
