import api from './api';

// Timesheet Entry API calls
export const timesheetApi = {
  // Get all entries
  getEntries: () => api.get('/timesheet-entries'),
    // Get calendar formatted entries
  getCalendarEntries: (startDate, endDate) => {
    const params = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    return api.get('/timesheet-entries/calendar', { params });
  },
  
  // Get totals for date range
  getTotals: (startDate, endDate) => {
    const params = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    return api.get('/timesheet-entries/totals', { params });
  },
  
  // Create new entry
  createEntry: (entry) => api.post('/timesheet-entries', entry),
  
  // Update entry
  updateEntry: (id, entry) => api.put(`/timesheet-entries/${id}`, entry),
  
  // Delete entry
  deleteEntry: (id) => api.delete(`/timesheet-entries/${id}`),
  
  // Get entry by ID
  getEntry: (id) => api.get(`/timesheet-entries/${id}`)
};

// Alarm API calls
export const alarmApi = {
  // Get all alarms
  getAlarms: () => api.get('/alarms'),
  
  // Create new alarm
  createAlarm: (alarm) => api.post('/alarms', alarm),
  
  // Update alarm
  updateAlarm: (id, alarm) => api.put(`/alarms/${id}`, alarm),
  
  // Delete alarm
  deleteAlarm: (id) => api.delete(`/alarms/${id}`),
  
  // Trigger alarm
  triggerAlarm: (id) => api.patch(`/alarms/${id}/trigger`),
  
  // Snooze alarm
  snoozeAlarm: (id, minutes = 5) => api.patch(`/alarms/${id}/snooze`, { minutes }),
  
  // Dismiss alarm
  dismissAlarm: (id) => api.patch(`/alarms/${id}/dismiss`)
};

// Settings API calls
export const settingsApi = {
  // Get all settings
  getSettings: () => api.get('/settings'),
  
  // Update settings
  updateSettings: (settings) => api.put('/settings', settings),
  
  // Update pay rate
  updatePayRate: (payRate) => api.patch('/settings/pay-rate', { defaultPayRate: payRate }),
  
  // Update overtime settings
  updateOvertimeSettings: (settings) => api.patch('/settings/overtime', settings),
  
  // Update notification settings
  updateNotificationSettings: (settings) => api.patch('/settings/notifications', settings)
};

// Dashboard API calls
export const dashboardApi = {
  // Get dashboard overview
  getOverview: () => api.get('/dashboard/overview'),
  
  // Get weekly summary
  getWeeklySummary: (startDate, endDate) => {
    const params = {};
    if (startDate) params.start = startDate;
    if (endDate) params.end = endDate;
    return api.get('/dashboard/weekly', { params });
  },
  
  // Get monthly summary
  getMonthlySummary: (year, month) => {
    const params = {};
    if (year) params.year = year;
    if (month) params.month = month;
    return api.get('/dashboard/monthly', { params });
  },
    // Get project breakdown
  getProjectBreakdown: (startDate, endDate) => {
    const params = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    return api.get('/timesheet-entries/projects/summary', { params });
  }
};
