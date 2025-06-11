import { alarmApi } from '../../services/apiService';

// Alarm action creators
export const fetchAlarms = () => async (dispatch) => {
  dispatch({ type: 'ALARMS_LOADING' });
  try {
    const response = await alarmApi.getAlarms();
    // Extract the alarms array from the response
    const alarms = response.data.alarms || [];
    dispatch({ type: 'FETCH_ALARMS_SUCCESS', payload: alarms });
  } catch (error) {
    dispatch({ type: 'ALARMS_ERROR', payload: error.message });
  }
};

export const createAlarm = (alarm) => async (dispatch) => {
  dispatch({ type: 'ALARMS_LOADING' });
  try {
    const response = await alarmApi.createAlarm(alarm);
    dispatch({ type: 'CREATE_ALARM_SUCCESS', payload: response.data });
    return response.data;
  } catch (error) {
    dispatch({ type: 'ALARMS_ERROR', payload: error.message });
    throw error;
  }
};

export const updateAlarm = (id, alarm) => async (dispatch) => {
  dispatch({ type: 'ALARMS_LOADING' });
  try {
    const response = await alarmApi.updateAlarm(id, alarm);
    dispatch({ type: 'UPDATE_ALARM_SUCCESS', payload: response.data });
    return response.data;
  } catch (error) {
    dispatch({ type: 'ALARMS_ERROR', payload: error.message });
    throw error;
  }
};

export const deleteAlarm = (id) => async (dispatch) => {
  dispatch({ type: 'ALARMS_LOADING' });
  try {
    await alarmApi.deleteAlarm(id);
    dispatch({ type: 'DELETE_ALARM_SUCCESS', payload: id });
  } catch (error) {
    dispatch({ type: 'ALARMS_ERROR', payload: error.message });
    throw error;
  }
};

export const triggerAlarm = (id) => async (dispatch) => {
  try {
    await alarmApi.triggerAlarm(id);
    dispatch({ type: 'TRIGGER_ALARM', payload: id });
  } catch (error) {
    dispatch({ type: 'ALARMS_ERROR', payload: error.message });
  }
};

export const snoozeAlarm = (id, minutes = 5) => async (dispatch) => {
  try {
    const response = await alarmApi.snoozeAlarm(id, minutes);
    dispatch({ 
      type: 'SNOOZE_ALARM', 
      payload: { 
        id, 
        newTriggerTime: response.data.triggerTime 
      } 
    });
  } catch (error) {
    dispatch({ type: 'ALARMS_ERROR', payload: error.message });
  }
};

export const dismissAlarm = (id) => async (dispatch) => {
  try {
    await alarmApi.dismissAlarm(id);
    dispatch({ type: 'DISMISS_ALARM', payload: id });
  } catch (error) {
    dispatch({ type: 'ALARMS_ERROR', payload: error.message });
  }
};
