import { timesheetApi } from '../../services/apiService';

// Action creators for timesheet entries
export const fetchEntries = () => async (dispatch) => {
  dispatch({ type: 'TIMESHEET_LOADING' });
  try {
    const response = await timesheetApi.getEntries();
    // Normalize entries and auto-mark approved if end time has passed
    const raw = response.data;
    let entries = raw;
    if (raw && !Array.isArray(raw) && Array.isArray(raw.entries)) {
      entries = raw.entries;
    }

    const now = new Date();
    if (Array.isArray(entries)) {
      entries = entries.map(e => {
        const endVal = e.endTime || e.end || e.endDate || e.end_time;
        const endDate = endVal ? new Date(endVal) : null;
        const statusDefault = e.status || 'draft';
        if (endDate && !isNaN(endDate.getTime()) && endDate <= now) {
          return { ...e, status: 'approved' };
        }
        return { ...e, status: statusDefault };
      });
    }

    dispatch({ type: 'FETCH_ENTRIES_SUCCESS', payload: entries });
  } catch (error) {
    dispatch({ type: 'TIMESHEET_ERROR', payload: error.message });
  }
};

export const fetchCalendarEvents = (startDate, endDate) => async (dispatch) => {
  dispatch({ type: 'TIMESHEET_LOADING' });
  try {
    const response = await timesheetApi.getCalendarEntries(startDate, endDate);
    
    // Extract the events array from the response and convert date strings to Date objects
    const rawEvents = response.data.events || [];

    const events = rawEvents.map(event => {
      // Ensure start and end are valid Date objects
      const startDate = new Date(event.start);
      const endDate = new Date(event.end);
      
      // Validate dates
      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        console.warn('Invalid date in event:', event);
        return null;
      }
      
      // Ensure all required fields are present with defaults
      const base = {
        ...event,
        start: startDate,
        end: endDate,
        title: event.title || event.project || event.description || 'Work Entry',
        hoursWorked: event.hoursWorked || 0,
        calculatedPay: event.calculatedPay || 0,
        category: event.category || 'regular',
        status: event.status || 'draft',
        project: event.project || '',
        description: event.description || ''
      };

      // Auto-approve if end has passed
      const now = new Date();
      if (endDate && !isNaN(endDate.getTime()) && endDate <= now) {
        base.status = 'approved';
      }

      return base;
    }).filter(Boolean); // Remove null events
    
    dispatch({ type: 'FETCH_CALENDAR_EVENTS_SUCCESS', payload: events });
  } catch (error) {
    console.error('Error fetching calendar events:', error);
    dispatch({ type: 'TIMESHEET_ERROR', payload: error.message });
  }
};

export const createEntry = (entry) => async (dispatch) => {
  dispatch({ type: 'TIMESHEET_LOADING' });
  try {
    const response = await timesheetApi.createEntry(entry);
    const newEntry = response.data;
    
    // Dispatch the creation success
    dispatch({ type: 'CREATE_ENTRY_SUCCESS', payload: newEntry });
    
    // Also add the new entry to calendar events if it has valid dates
    if (newEntry.startTime && newEntry.endTime) {
      const startDate = new Date(newEntry.startTime);
      const endDate = new Date(newEntry.endTime);
      
      if (!isNaN(startDate.getTime()) && !isNaN(endDate.getTime())) {
        const calendarEvent = {
          id: newEntry._id.toString(),
          title: newEntry.project || newEntry.description || 'Work Entry',
          start: startDate,
          end: endDate,
          hoursWorked: newEntry.hoursWorked || 0,
          calculatedPay: newEntry.calculatedPay || 0,
          category: newEntry.category || 'regular',
          status: newEntry.status || 'draft',
          project: newEntry.project || '',
          description: newEntry.description || '',
          payRateOverride: newEntry.payRateOverride
        };
        // Auto-approve if end time already passed
        if (endDate <= new Date()) {
          calendarEvent.status = 'approved';
        }
        // Add to calendar events
        dispatch({ type: 'ADD_CALENDAR_EVENT', payload: calendarEvent });
      }
    }
    
    return newEntry;
  } catch (error) {
    dispatch({ type: 'TIMESHEET_ERROR', payload: error.message });
    throw error;
  }
};

export const updateEntry = (id, entry) => async (dispatch) => {
  dispatch({ type: 'TIMESHEET_LOADING' });
  try {
    const response = await timesheetApi.updateEntry(id, entry);
    dispatch({ type: 'UPDATE_ENTRY_SUCCESS', payload: response.data });
    return response.data;
  } catch (error) {
    dispatch({ type: 'TIMESHEET_ERROR', payload: error.message });
    throw error;
  }
};

export const deleteEntry = (id) => async (dispatch) => {
  dispatch({ type: 'TIMESHEET_LOADING' });
  try {
    await timesheetApi.deleteEntry(id);
    dispatch({ type: 'DELETE_ENTRY_SUCCESS', payload: id });
  } catch (error) {
    dispatch({ type: 'TIMESHEET_ERROR', payload: error.message });
    throw error;
  }
};

export const fetchTotals = (startDate, endDate) => async (dispatch) => {
  try {
    const response = await timesheetApi.getTotals(startDate, endDate);
    dispatch({ type: 'FETCH_TOTALS_SUCCESS', payload: response.data });
  } catch (error) {
    dispatch({ type: 'TIMESHEET_ERROR', payload: error.message });
  }
};

export const setSelectedEntry = (entry) => ({
  type: 'SET_SELECTED_ENTRY',
  payload: entry
});
