import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import store from './store/store';
import Navbar from './components/Navigation/Navbar';
import CalendarView from './components/Calendar/CalendarView';
import Dashboard from './components/Dashboard/Dashboard';
import Alarms from './components/Alarms/Alarms';
import Settings from './components/Settings/Settings';
import './App.css';

function App() {
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
              <Route path="/alarms" element={<Alarms />} />
              <Route path="/settings" element={<Settings />} />
            </Routes>
          </main>
        </div>
      </Router>
    </Provider>
  );
}

export default App;
