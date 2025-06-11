const initialState = {
  alarms: [],
  loading: false,
  error: null,
  selectedAlarm: null
};

const alarmReducer = (state = initialState, action) => {
  switch (action.type) {
    case 'ALARMS_LOADING':
      return {
        ...state,
        loading: true,
        error: null
      };
    case 'FETCH_ALARMS_SUCCESS':
      return {
        ...state,
        alarms: action.payload,
        loading: false,
        error: null
      };
    case 'CREATE_ALARM_SUCCESS':
      return {
        ...state,
        alarms: [...state.alarms, action.payload],
        loading: false,
        error: null
      };
    case 'UPDATE_ALARM_SUCCESS':
      return {
        ...state,
        alarms: state.alarms.map(alarm => 
          alarm._id === action.payload._id ? action.payload : alarm
        ),
        loading: false,
        error: null
      };
    case 'DELETE_ALARM_SUCCESS':
      return {
        ...state,
        alarms: state.alarms.filter(alarm => alarm._id !== action.payload),
        loading: false,
        error: null
      };
    case 'TRIGGER_ALARM':
      return {
        ...state,
        alarms: state.alarms.map(alarm => 
          alarm._id === action.payload 
            ? { ...alarm, isTriggered: true }
            : alarm
        )
      };
    case 'SNOOZE_ALARM':
      return {
        ...state,
        alarms: state.alarms.map(alarm => 
          alarm._id === action.payload.id 
            ? { 
                ...alarm, 
                isTriggered: false,
                triggerTime: action.payload.newTriggerTime
              }
            : alarm
        )
      };
    case 'DISMISS_ALARM':
      return {
        ...state,
        alarms: state.alarms.map(alarm => 
          alarm._id === action.payload 
            ? { ...alarm, isTriggered: false, isDismissed: true }
            : alarm
        )
      };
    case 'ALARMS_ERROR':
      return {
        ...state,
        loading: false,
        error: action.payload
      };
    default:
      return state;
  }
};

export default alarmReducer;
