import React, { useState } from 'react';
import moment from 'moment';

const AlarmModal = ({ isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    title: '',
    triggerTime: moment().add(1, 'hour').format('YYYY-MM-DDTHH:mm'),
    type: 'work_start',
    message: '',
    isEnabled: true
  });

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const alarmData = {
      ...formData,
      triggerTime: new Date(formData.triggerTime).toISOString()
    };

    onSave(alarmData);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Create New Alarm</h2>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>

        <form onSubmit={handleSubmit} className="alarm-form">
          <div className="form-group">
            <label htmlFor="title">Title</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              required
              placeholder="e.g., Start Work Reminder"
            />
          </div>

          <div className="form-group">
            <label htmlFor="triggerTime">Date & Time</label>
            <input
              type="datetime-local"
              id="triggerTime"
              name="triggerTime"
              value={formData.triggerTime}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="type">Alarm Type</label>
            <select
              id="type"
              name="type"
              value={formData.type}
              onChange={handleInputChange}
            >
              <option value="work_start">Work Start</option>
              <option value="work_end">Work End</option>
              <option value="break_start">Break Start</option>
              <option value="break_end">Break End</option>
              <option value="meeting">Meeting</option>
              <option value="custom">Custom</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="message">Message (Optional)</label>
            <textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleInputChange}
              rows="3"
              placeholder="Custom alarm message..."
            />
          </div>

          <div className="form-group checkbox-group">
            <label>
              <input
                type="checkbox"
                name="isEnabled"
                checked={formData.isEnabled}
                onChange={handleInputChange}
              />
              Enable this alarm
            </label>
          </div>

          <div className="modal-actions">
            <button type="button" className="cancel-btn" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="save-btn">
              Create Alarm
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AlarmModal;
