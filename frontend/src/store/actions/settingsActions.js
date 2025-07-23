import { settingsApi } from '../../services/apiService';

// Settings action creators
export const fetchSettings = () => async (dispatch) => {
  dispatch({ type: 'SETTINGS_LOADING' });
  try {
    const response = await settingsApi.getSettings();
    // Keep all settings including theme for account-bound functionality
    dispatch({ type: 'FETCH_SETTINGS_SUCCESS', payload: response.data });
  } catch (error) {
    dispatch({ type: 'SETTINGS_ERROR', payload: error.message });
  }
};

export const updateSettings = (settings) => async (dispatch) => {
  dispatch({ type: 'SETTINGS_LOADING' });
  try {
    // Send all settings including theme to backend for account-bound storage
    const response = await settingsApi.updateSettings(settings);
    // Store all settings including theme in Redux
    dispatch({ type: 'UPDATE_SETTINGS_SUCCESS', payload: response.data });
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
