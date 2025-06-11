import { settingsApi } from '../../services/apiService';

// Settings action creators
export const fetchSettings = () => async (dispatch) => {
  dispatch({ type: 'SETTINGS_LOADING' });
  try {
    const response = await settingsApi.getSettings();
    dispatch({ type: 'FETCH_SETTINGS_SUCCESS', payload: response.data });
  } catch (error) {
    dispatch({ type: 'SETTINGS_ERROR', payload: error.message });
  }
};

export const updateSettings = (settings) => async (dispatch) => {
  dispatch({ type: 'SETTINGS_LOADING' });
  try {
    const response = await settingsApi.updateSettings(settings);
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
