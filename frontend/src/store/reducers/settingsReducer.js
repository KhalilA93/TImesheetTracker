const initialState = {
  settings: {
    defaultPayRate: 30,
    overtimeThreshold: 8,
    overtimeMultiplier: 1.5,
    timeFormat: '12h',
    colorScheme: {
      regular: '#3174ad',
      overtime: '#dc3545',
      holiday: '#28a745',
      sick: '#ffc107',
      vacation: '#17a2b8',
      training: '#6f42c1',
      meeting: '#fd7e14'
    },
    notifications: {
      enabled: true,
      sound: true,
      desktop: true
    }
  },
  loading: false,
  error: null
};

const settingsReducer = (state = initialState, action) => {
  switch (action.type) {
    case 'SETTINGS_LOADING':
      return {
        ...state,
        loading: true,
        error: null
      };
    case 'FETCH_SETTINGS_SUCCESS':
      return {
        ...state,
        settings: { ...state.settings, ...action.payload },
        loading: false,
        error: null
      };
    case 'UPDATE_SETTINGS_SUCCESS':
      return {
        ...state,
        settings: { ...state.settings, ...action.payload },
        loading: false,
        error: null
      };
    case 'SETTINGS_ERROR':
      return {
        ...state,
        loading: false,
        error: action.payload
      };
    default:
      return state;
  }
};

export default settingsReducer;
