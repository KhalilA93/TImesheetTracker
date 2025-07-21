import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import * as authService from '../../services/authService';
import './Navbar.css';

const Navbar = () => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

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
          </li>
          <li className="nav-item">
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

        {/* User Menu */}
        <div className="nav-user">
          <div 
            className="user-avatar"
            onClick={() => setShowUserMenu(!showUserMenu)}
          >
            {user.name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          
          {showUserMenu && (
            <div className="user-dropdown">
              <div className="user-info">
                <div className="user-name">{user.name}</div>
                <div className="user-email">{user.email}</div>
              </div>
              <button onClick={handleLogout} className="logout-btn">
                🚪 Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
