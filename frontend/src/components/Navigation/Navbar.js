import React from 'react';
import { NavLink } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="nav-container">
        <div className="nav-logo">
          <h2>TimeSheet Tracker</h2>
        </div>
        
        <ul className="nav-menu">
          <li className="nav-item">
            <NavLink 
              to="/calendar" 
              className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
            >
              📅 Calendar
            </NavLink>
          </li>          <li className="nav-item">
            <NavLink 
              to="/dashboard" 
              className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
            >
              📊 Dashboard
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink 
              to="/settings" 
              className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
            >
              ⚙️ Settings
            </NavLink>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
