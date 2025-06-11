import { timesheetApi } from '../../services/apiService';

// Action creators for timesheet entries
export const fetchEntries = () => async (dispatch) => {
  dispatch({ type: 'TIMESHEET_LOADING' });
  try {
    const response = await timesheetApi.getEntries();
    dispatch({ type: 'FETCH_ENTRIES_SUCCESS', payload: response.data });
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
        console.error('Invalid date in event:', event);
        return null;
      }
      
      return {
        ...event,
        start: startDate,
        end: endDate
      };
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
    dispatch({ type: 'CREATE_ENTRY_SUCCESS', payload: response.data });
    return response.data;
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
