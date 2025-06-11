import React from 'react';
import './StatCard.css';

const StatCard = ({ title, hours, pay, icon, color }) => {
  return (
    <div className="stat-card" style={{ borderTopColor: color }}>
      <div className="stat-header">
        <span className="stat-icon">{icon}</span>
        <h3 className="stat-title">{title}</h3>
      </div>
      <div className="stat-content">
        <div className="stat-item">
          <span className="stat-label">Hours</span>
          <span className="stat-value">{hours.toFixed(1)}h</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Earnings</span>
          <span className="stat-value" style={{ color }}>${pay.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
};

export default StatCard;
