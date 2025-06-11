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
    case 'CREATE_ENTRY_SUCCESS':
      return {
        ...state,
        entries: [...state.entries, action.payload],
        loading: false,
        error: null
      };
    case 'UPDATE_ENTRY_SUCCESS':
      return {
        ...state,
        entries: state.entries.map(entry => 
          entry._id === action.payload._id ? action.payload : entry
        ),
        loading: false,
        error: null
      };
    case 'DELETE_ENTRY_SUCCESS':
      return {
        ...state,
        entries: state.entries.filter(entry => entry._id !== action.payload),
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
