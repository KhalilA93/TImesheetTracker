import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import store from './store/store';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeManager } from './utils/themeManager';
import Navbar from './components/Navigation/Navbar';
import CalendarView from './components/Calendar/CalendarView';
import Dashboard from './components/Dashboard/Dashboard';
import Settings from './components/Settings/Settings';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import './App.css';

function App() {
  // Initialize theme on app startup
  useEffect(() => {
    ThemeManager.initialize();
  }, []);

  return (
    <Provider store={store}>
      <AuthProvider>
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
          </Routes>
        </div>
      </Router>
      </AuthProvider>
    </Provider>
  );
}

export default App;
