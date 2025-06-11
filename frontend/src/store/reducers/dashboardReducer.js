const initialState = {
  overview: {
    todayHours: 0,
    todayPay: 0,
    weekHours: 0,
    weekPay: 0,
    monthHours: 0,
    monthPay: 0
  },
  weeklyData: [],
  monthlyData: [],
  projectBreakdown: [],
  categoryStats: [],
  loading: false,
  error: null
};

const dashboardReducer = (state = initialState, action) => {
  switch (action.type) {
    case 'DASHBOARD_LOADING':
      return {
        ...state,
        loading: true,
        error: null
      };
    case 'FETCH_DASHBOARD_OVERVIEW_SUCCESS':
      return {
        ...state,
        overview: action.payload,
        loading: false,
        error: null
      };
    case 'FETCH_WEEKLY_DATA_SUCCESS':
      return {
        ...state,
        weeklyData: action.payload,
        loading: false,
        error: null
      };
    case 'FETCH_MONTHLY_DATA_SUCCESS':
      return {
        ...state,
        monthlyData: action.payload,
        loading: false,
        error: null
      };
    case 'FETCH_PROJECT_BREAKDOWN_SUCCESS':
      return {
        ...state,
        projectBreakdown: action.payload,
        loading: false,
        error: null
      };
    case 'FETCH_CATEGORY_STATS_SUCCESS':
      return {
        ...state,
        categoryStats: action.payload,
        loading: false,
        error: null
      };
    case 'DASHBOARD_ERROR':
      return {
        ...state,
        loading: false,
        error: action.payload
      };
    default:
      return state;
  }
};

export default dashboardReducer;
