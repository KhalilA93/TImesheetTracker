const initialState = {
  entries: [],
  calendarEvents: [],
  loading: false,
  error: null,
  selectedEntry: null,
  totals: {
    totalHours: 0,
    totalPay: 0,
    entryCount: 0
  }
};

const timesheetReducer = (state = initialState, action) => {
  switch (action.type) {
    case 'TIMESHEET_LOADING':
      return {
        ...state,
        loading: true,
        error: null
      };
    case 'FETCH_ENTRIES_SUCCESS':
      return {
        ...state,
        entries: action.payload,
        loading: false,
        error: null
      };
    case 'FETCH_CALENDAR_EVENTS_SUCCESS':
      return {
        ...state,
        calendarEvents: action.payload,
        loading: false,
        error: null
      };
    case 'ADD_CALENDAR_EVENT':
      // Add new event to calendar events (used when creating new entries)
      return {
        ...state,
        calendarEvents: [...state.calendarEvents, action.payload],
        loading: false,
        error: null
      };
    case 'CREATE_ENTRY_SUCCESS':
      // Note: We don't automatically add to calendarEvents here because the calendar
      // will refresh and fetch the updated events with proper formatting
      return {
        ...state,
        entries: [...state.entries, action.payload],
        loading: false,
        error: null
      };
    case 'UPDATE_ENTRY_SUCCESS':
      // Update the entry in the entries array and also update calendar events if it exists
      const updatedCalendarEvents = state.calendarEvents.map(event => {
        if (event.id === action.payload._id) {
          // Convert the updated entry to calendar event format
          return {
            ...event,
            title: action.payload.project || action.payload.description || 'Work Entry',
            start: new Date(action.payload.startTime),
            end: new Date(action.payload.endTime),
            hoursWorked: action.payload.hoursWorked,
            calculatedPay: action.payload.calculatedPay,
            project: action.payload.project,
            category: action.payload.category,
            description: action.payload.description,
            status: action.payload.status,
            payRateOverride: action.payload.payRateOverride
          };
        }
        return event;
      });
      
      return {
        ...state,
        entries: state.entries.map(entry => 
          entry._id === action.payload._id ? action.payload : entry
        ),
        calendarEvents: updatedCalendarEvents,
        loading: false,
        error: null
      };
    case 'DELETE_ENTRY_SUCCESS':
      // Remove from both entries and calendar events
      return {
        ...state,
        entries: state.entries.filter(entry => entry._id !== action.payload),
        calendarEvents: state.calendarEvents.filter(event => event.id !== action.payload),
        loading: false,
        error: null
      };
    case 'SET_SELECTED_ENTRY':
      return {
        ...state,
        selectedEntry: action.payload
      };
    case 'FETCH_TOTALS_SUCCESS':
      return {
        ...state,
        totals: action.payload,
        loading: false,
        error: null
      };
    case 'TIMESHEET_ERROR':
      return {
        ...state,
        loading: false,
        error: action.payload
      };
    default:
      return state;
  }
};

export default timesheetReducer;
