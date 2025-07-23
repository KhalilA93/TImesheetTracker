import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider, useDispatch, useSelector } from 'react-redux';
import store from './store/store';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeManager } from './utils/themeManager';
import { fetchSettings } from './store/actions/settingsActions';
import Navbar from './components/Navigation/Navbar';
import CalendarView from './components/Calendar/CalendarView';
import Dashboard from './components/Dashboard/Dashboard';
import Settings from './components/Settings/Settings';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import './App.css';

// Main app content component that has access to auth context
function AppContent() {
  const { user, isAuthenticated } = useAuth();
  const dispatch = useDispatch();
  const { settings } = useSelector(state => state.settings);

  // Initialize theme on app startup
  useEffect(() => {
    ThemeManager.initialize();
  }, []);

  // Load user settings when authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      dispatch(fetchSettings());
    }
  }, [dispatch, isAuthenticated, user]);

  // Apply user's theme settings when loaded from backend
  useEffect(() => {
    if (settings && settings.theme && user && user._id) {
      const mergedTheme = ThemeManager.initializeForUser(user._id, settings.theme);
    }
  }, [settings, user]);

  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Protected routes */}
          <Route path="/" element={
            <ProtectedRoute>
              <Navbar />
              <main className="main-content">
                <Navigate to="/calendar" replace />
              </main>
            </ProtectedRoute>
          } />
          
          <Route path="/calendar" element={
            <ProtectedRoute>
              <Navbar />
              <main className="main-content">
                <CalendarView />
              </main>
            </ProtectedRoute>
          } />
          
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Navbar />
              <main className="main-content">
                <Dashboard />
              </main>
            </ProtectedRoute>
          } />
          
          <Route path="/settings" element={
            <ProtectedRoute>
              <Navbar />
              <main className="main-content">
                <Settings />
              </main>
            </ProtectedRoute>
          } />
          
          {/* Catch-all redirect */}
          <Route path="*" element={<Navigate to="/calendar" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

function App() {
  return (
    <Provider store={store}>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Provider>
  );
}

export default App;
