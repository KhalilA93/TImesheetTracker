import { createStore, combineReducers, applyMiddleware } from 'redux';
import { thunk } from 'redux-thunk';
import timesheetReducer from './reducers/timesheetReducer';
import alarmReducer from './reducers/alarmReducer';
import settingsReducer from './reducers/settingsReducer';
import dashboardReducer from './reducers/dashboardReducer';

const rootReducer = combineReducers({
  timesheet: timesheetReducer,
  alarms: alarmReducer,
  settings: settingsReducer,
  dashboard: dashboardReducer
});

const store = createStore(
  rootReducer,
  applyMiddleware(thunk)
);

export default store;
