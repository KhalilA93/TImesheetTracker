import { settingsApi } from '../../services/apiService';

// Settings action creators
export const fetchSettings = () => async (dispatch) => {
  dispatch({ type: 'SETTINGS_LOADING' });
  try {
    const response = await settingsApi.getSettings();
    // Remove theme from backend response to prevent localStorage override
    const { theme, ...settingsWithoutTheme } = response.data;
    dispatch({ type: 'FETCH_SETTINGS_SUCCESS', payload: settingsWithoutTheme });
  } catch (error) {
    dispatch({ type: 'SETTINGS_ERROR', payload: error.message });
  }
};

export const updateSettings = (settings) => async (dispatch) => {
  dispatch({ type: 'SETTINGS_LOADING' });
  try {
    // Remove theme from settings before sending to backend
    const { theme, ...settingsWithoutTheme } = settings;
    const response = await settingsApi.updateSettings(settingsWithoutTheme);
    // Also remove theme from response before storing in Redux
    const { theme: responseTheme, ...responseWithoutTheme } = response.data;
    dispatch({ type: 'UPDATE_SETTINGS_SUCCESS', payload: responseWithoutTheme });
    return response.data;
  } catch (error) {
    dispatch({ type: 'SETTINGS_ERROR', payload: error.message });
    throw error;
  }
};

export const updatePayRate = (payRate) => async (dispatch) => {
  try {
    const response = await settingsApi.updatePayRate(payRate);
    dispatch({ type: 'UPDATE_SETTINGS_SUCCESS', payload: response.data });
    return response.data;
  } catch (error) {
    dispatch({ type: 'SETTINGS_ERROR', payload: error.message });
    throw error;
  }
};
