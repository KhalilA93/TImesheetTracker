import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import store from './store/store';
import { ThemeManager } from './utils/themeManager';
import Navbar from './components/Navigation/Navbar';
import CalendarView from './components/Calendar/CalendarView';
import Dashboard from './components/Dashboard/Dashboard';
import Settings from './components/Settings/Settings';
import './App.css';

function App() {
  // Initialize theme on app startup
  useEffect(() => {
    ThemeManager.initialize();
  }, []);

  return (
    <Provider store={store}>
      <Router>
        <div className="App">
          <Navbar />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<CalendarView />} />
              <Route path="/calendar" element={<CalendarView />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/settings" element={<Settings />} />
            </Routes>
          </main>
        </div>
      </Router>
    </Provider>
  );
}

export default App;
