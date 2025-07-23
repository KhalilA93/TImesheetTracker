import React, { createContext, useContext, useState, useEffect } from 'react';
import * as authService from '../services/authService';
import { ThemeManager } from '../utils/themeManager';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize auth state
  useEffect(() => {
    const initAuth = async () => {
      try {
        if (authService.isAuthenticated()) {
          const userData = await authService.getCurrentUser();
          setUser(userData);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        // Clear invalid token
        authService.logout();
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  // Login function
  const login = async (credentials) => {
    try {
      setError(null);
      setLoading(true);
      
      const response = await authService.login(credentials);
      
      if (response.token && response.user) {
        // Store token in localStorage
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
        setUser(response.user);
        return { success: true, user: response.user };
      } else {
        throw new Error(response.message || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Login failed';
      setError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Register function
  const register = async (userData) => {
    try {
      setError(null);
      setLoading(true);
      
      const response = await authService.register(userData);
      
      if (response.token && response.user) {
        // Store token in localStorage
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
        setUser(response.user);
        return { success: true, user: response.user };
      } else {
        throw new Error(response.message || 'Registration failed');
      }
    } catch (error) {
      console.error('Registration error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Registration failed';
      setError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    // Clear theme data for current user
    if (user && user._id) {
      ThemeManager.clearUserTheme(user._id);
    }
    
    // Reset theme to defaults
    ThemeManager.resetTheme();
    
    authService.logout();
    setUser(null);
    setError(null);
  };

  // Update profile function
  const updateProfile = async (profileData) => {
    try {
      setError(null);
      
      const response = await authService.updateProfile(profileData);
      
      if (response.success) {
        setUser(response.user);
        return { success: true, user: response.user };
      } else {
        throw new Error(response.message || 'Profile update failed');
      }
    } catch (error) {
      const errorMessage = error.message || 'Profile update failed';
      setError(errorMessage);
      return { success: false, message: errorMessage };
    }
  };

  // Clear error function
  const clearError = () => {
    setError(null);
  };

  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    updateProfile,
    clearError,
    isAuthenticated: !!user && !!localStorage.getItem('token')
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
