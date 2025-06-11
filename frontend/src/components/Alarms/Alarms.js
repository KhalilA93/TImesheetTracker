import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAlarms, createAlarm, deleteAlarm } from '../../store/actions/alarmActions';
import AlarmCard from './AlarmCard';
import AlarmModal from './AlarmModal';
import './Alarms.css';

const Alarms = () => {
  const dispatch = useDispatch();
  const { alarms = [], loading, error } = useSelector(state => state.alarms || {});
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    dispatch(fetchAlarms());
  }, [dispatch]);

  const handleCreateAlarm = async (alarmData) => {
    try {
      await dispatch(createAlarm(alarmData));
      setShowModal(false);
      dispatch(fetchAlarms()); // Refresh list
    } catch (error) {
      console.error('Error creating alarm:', error);
    }
  };

  const handleDeleteAlarm = async (alarmId) => {
    try {
      await dispatch(deleteAlarm(alarmId));
      dispatch(fetchAlarms()); // Refresh list
    } catch (error) {
      console.error('Error deleting alarm:', error);
    }
  };

  if (loading) {
    return <div className="loading-spinner">Loading alarms...</div>;
  }

  if (error) {
    return <div className="error-message">Error: {error}</div>;
  }

  return (
    <div className="alarms-container">
      <div className="alarms-header">
        <h1>Work Alarms</h1>
        <button 
          className="add-alarm-btn"
          onClick={() => setShowModal(true)}
        >
          + Add Alarm
        </button>
      </div>      <div className="alarms-list">
        {!Array.isArray(alarms) || alarms.length === 0 ? (
          <div className="no-alarms">
            <p>No alarms set yet</p>
            <p>Create your first alarm to get work reminders</p>
          </div>
        ) : (
          alarms.map(alarm => (
            <AlarmCard
              key={alarm._id}
              alarm={alarm}
              onDelete={handleDeleteAlarm}
            />
          ))
        )}
      </div>

      {showModal && (
        <AlarmModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          onSave={handleCreateAlarm}
        />
      )}
    </div>
  );
};

export default Alarms;
