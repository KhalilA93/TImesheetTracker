import React from 'react';
import moment from 'moment';

const AlarmCard = ({ alarm, onDelete }) => {
  const formatTime = (time) => {
    return moment(time).format('h:mm A');
  };

  return (
    <div className="alarm-card">
      <div className="alarm-header">
        <h3>{alarm.title}</h3>
        <button 
          className="delete-alarm-btn"
          onClick={() => onDelete(alarm._id)}
        >
          🗑️
        </button>
      </div>
        <div className="alarm-details">
        <p><strong>Time:</strong> {formatTime(alarm.alarmTime)}</p>
        <p><strong>Type:</strong> {alarm.type}</p>
        {alarm.message && <p><strong>Message:</strong> {alarm.message}</p>}
        {alarm.timesheetEntryId && (
          <p><strong>Related Entry:</strong> Work session</p>
        )}
      </div>
        <div className="alarm-status">
        <span className={`status ${alarm.status === 'active' ? 'enabled' : 'disabled'}`}>
          {alarm.status === 'active' ? '✅ Active' : `❌ ${alarm.status}`}
        </span>
      </div>
    </div>
  );
};

export default AlarmCard;
