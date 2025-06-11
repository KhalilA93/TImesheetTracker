// Theme management utility
export class ThemeManager {
  static STORAGE_KEY = 'timesheet-theme';
  
  static defaultTheme = {
    darkMode: false,
    accentColor: '#007bff'
  };

  // Load theme from localStorage
  static loadTheme() {
    try {
      const saved = localStorage.getItem(this.STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return { ...this.defaultTheme, ...parsed };
      }
    } catch (error) {
      console.error('Error loading theme:', error);
    }
    return this.defaultTheme;
  }

  // Save theme to localStorage
  static saveTheme(theme) {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(theme));
      return true;
    } catch (error) {
      console.error('Error saving theme:', error);
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

  // Initialize theme on app startup
  static initialize() {
    const theme = this.loadTheme();
    this.applyTheme(theme);
    return theme;
  }

  // Update theme (save and apply)
  static updateTheme(newTheme) {
    const theme = { ...this.defaultTheme, ...newTheme };
    this.saveTheme(theme);
    this.applyTheme(theme);
    return theme;
  }
}
