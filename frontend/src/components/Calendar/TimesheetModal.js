import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import moment from 'moment';
import './TimesheetModal.css';

const TimesheetModal = ({ isOpen, onClose, onSave, onDelete, event, slot }) => {
  const { settings } = useSelector(state => state.settings);
  
  const [formData, setFormData] = useState({
    date: '',
    startTime: '',
    endTime: '',
    description: '',
    project: '',
    category: 'regular',
    payRateOverride: '',
    status: 'confirmed'
  });

  const [calculatedHours, setCalculatedHours] = useState(0);
  const [calculatedPay, setCalculatedPay] = useState(0);

  // Initialize form data when modal opens
  useEffect(() => {
    if (event) {
      // Editing existing event - get data from event object
      setFormData({
        date: moment(event.start).format('YYYY-MM-DD'),
        startTime: moment(event.start).format('HH:mm'),
        endTime: moment(event.end).format('HH:mm'),
        description: event.description || '',
        project: event.project || '',
        category: event.category || 'regular',
        payRateOverride: event.payRateOverride || '',
        status: event.status || 'confirmed'
      });
    } else if (slot) {
      // Creating new event from slot selection
      setFormData({
        date: moment(slot.start).format('YYYY-MM-DD'),
        startTime: moment(slot.start).format('HH:mm'),
        endTime: moment(slot.end).format('HH:mm'),
        description: '',
        project: '',
        category: 'regular',
        payRateOverride: '',
        status: 'confirmed'
      });
    } else {
      // Default empty form
      setFormData({
        date: moment().format('YYYY-MM-DD'),
        startTime: moment().format('HH:mm'),
        endTime: moment().add(1, 'hour').format('HH:mm'),
        description: '',
        project: '',
        category: 'regular',
        payRateOverride: '',
        status: 'confirmed'
      });
    }
  }, [event, slot]);

  // Calculate hours and pay when time changes
  useEffect(() => {
    if (formData.startTime && formData.endTime && formData.date) {
      const start = moment(`${formData.date} ${formData.startTime}`);
      const end = moment(`${formData.date} ${formData.endTime}`);
      
      if (end.isAfter(start)) {
        const hours = end.diff(start, 'hours', true);
        setCalculatedHours(hours);
        
        const payRate = formData.payRateOverride || settings.defaultPayRate || 0;
        const pay = hours * payRate;
        setCalculatedPay(pay);
      } else {
        setCalculatedHours(0);
        setCalculatedPay(0);
      }
    }
  }, [formData.startTime, formData.endTime, formData.date, formData.payRateOverride, settings.defaultPayRate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.date || !formData.startTime || !formData.endTime) {
      alert('Please fill in all required fields');
      return;
    }

    // Create ISO date strings
    const startDateTime = moment(`${formData.date} ${formData.startTime}`).toISOString();
    const endDateTime = moment(`${formData.date} ${formData.endTime}`).toISOString();
    
    // Create a proper date object for the date field (just the date part)
    const entryDate = moment(formData.date).startOf('day').toISOString();

    const entryData = {
      date: entryDate, // Send as ISO string that backend will convert to Date
      startTime: startDateTime,
      endTime: endDateTime,
      description: formData.description,
      project: formData.project,
      category: formData.category,
      status: formData.status
    };

    // Add pay rate override if specified
    if (formData.payRateOverride) {
      entryData.payRateOverride = parseFloat(formData.payRateOverride);
    }

    onSave(entryData);
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this entry?')) {
      onDelete(event.id);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{event ? 'Edit Timesheet Entry' : 'New Timesheet Entry'}</h2>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>

        <form onSubmit={handleSubmit} className="timesheet-form">
          <div className="form-group">
            <label htmlFor="date">Date *</label>
            <input
              type="date"
              id="date"
              name="date"
              value={formData.date}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="startTime">Start Time *</label>
              <input
                type="time"
                id="startTime"
                name="startTime"
                value={formData.startTime}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="endTime">End Time *</label>
              <input
                type="time"
                id="endTime"
                name="endTime"
                value={formData.endTime}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>

          <div className="calculated-info">
            <span>Hours: {calculatedHours.toFixed(2)}</span>
            <span>Pay: ${calculatedPay.toFixed(2)}</span>
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows="3"
              placeholder="What did you work on?"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="project">Project</label>
              <input
                type="text"
                id="project"
                name="project"
                value={formData.project}
                onChange={handleInputChange}
                placeholder="Project name"
              />
            </div>
            <div className="form-group">
              <label htmlFor="category">Category</label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
              >
                <option value="regular">Regular</option>
                <option value="holiday">Holiday</option>
                <option value="sick">Sick</option>
                <option value="vacation">Vacation</option>
                <option value="training">Training</option>
                <option value="meeting">Meeting</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="payRateOverride">Pay Rate Override ($/hour)</label>
              <input
                type="number"
                id="payRateOverride"
                name="payRateOverride"
                value={formData.payRateOverride}
                onChange={handleInputChange}
                min="0"
                step="0.01"
                placeholder={`Default: $${settings.defaultPayRate || 0}/hr`}
              />
            </div>
            <div className="form-group">
              <label htmlFor="status">Status</label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleInputChange}
              >
                <option value="draft">Draft</option>
                <option value="confirmed">Confirmed</option>
                <option value="submitted">Submitted</option>
                <option value="approved">Approved</option>
              </select>
            </div>
          </div>

          <div className="modal-actions">
            {event && (
              <button 
                type="button" 
                className="delete-btn"
                onClick={handleDelete}
              >
                Delete
              </button>
            )}
            <div className="action-buttons">
              <button type="button" className="cancel-btn" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="save-btn">
                {event ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TimesheetModal;
