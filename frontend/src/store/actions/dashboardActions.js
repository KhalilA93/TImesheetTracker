import { dashboardApi } from '../../services/apiService';

// Dashboard action creators
export const fetchDashboardOverview = () => async (dispatch) => {
  dispatch({ type: 'DASHBOARD_LOADING' });
  try {
    const response = await dashboardApi.getOverview();
    dispatch({ type: 'FETCH_DASHBOARD_OVERVIEW_SUCCESS', payload: response.data });
  } catch (error) {
    dispatch({ type: 'DASHBOARD_ERROR', payload: error.message });
  }
};

export const fetchWeeklyData = (startDate, endDate) => async (dispatch) => {
  dispatch({ type: 'DASHBOARD_LOADING' });
  try {
    const response = await dashboardApi.getWeeklySummary(startDate, endDate);
    dispatch({ type: 'FETCH_WEEKLY_DATA_SUCCESS', payload: response.data });
  } catch (error) {
    dispatch({ type: 'DASHBOARD_ERROR', payload: error.message });
  }
};

export const fetchMonthlyData = (year, month) => async (dispatch) => {
  dispatch({ type: 'DASHBOARD_LOADING' });
  try {
    const response = await dashboardApi.getMonthlySummary(year, month);
    dispatch({ type: 'FETCH_MONTHLY_DATA_SUCCESS', payload: response.data });
  } catch (error) {
    dispatch({ type: 'DASHBOARD_ERROR', payload: error.message });
  }
};

export const fetchProjectBreakdown = (startDate, endDate) => async (dispatch) => {
  try {
    const response = await dashboardApi.getProjectBreakdown(startDate, endDate);
    dispatch({ type: 'FETCH_PROJECT_BREAKDOWN_SUCCESS', payload: response.data });
  } catch (error) {
    dispatch({ type: 'DASHBOARD_ERROR', payload: error.message });
  }
};
