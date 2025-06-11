import React, { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Calendar, momentLocalizer, Views } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { fetchCalendarEvents, createEntry, updateEntry, deleteEntry } from '../../store/actions/timesheetActions';
import TimesheetModal from './TimesheetModal';
import './CalendarView.css';

// Setup the localizer for react-big-calendar
const localizer = momentLocalizer(moment);

const CalendarView = () => {
  const dispatch = useDispatch();
  const { calendarEvents, loading, error } = useSelector(state => state.timesheet);
  const { settings } = useSelector(state => state.settings);
  
  const [showModal, setShowModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [view, setView] = useState(Views.WEEK);
  const [date, setDate] = useState(new Date());
  // Fetch calendar events when view or date changes
  useEffect(() => {
    let startDate, endDate;
    
    switch (view) {
      case Views.DAY:
        startDate = moment(date).startOf('day').toISOString();
        endDate = moment(date).endOf('day').toISOString();
        break;
      case Views.WEEK:
        startDate = moment(date).startOf('week').toISOString();
        endDate = moment(date).endOf('week').toISOString();
        break;
      case Views.MONTH:
        startDate = moment(date).startOf('month').toISOString();
        endDate = moment(date).endOf('month').toISOString();
        break;
      default:
        startDate = moment(date).startOf('week').toISOString();
        endDate = moment(date).endOf('week').toISOString();
    }
    
    dispatch(fetchCalendarEvents(startDate, endDate));
  }, [dispatch, date, view]);

  // Handle clicking on an existing event
  const handleSelectEvent = useCallback((event) => {
    setSelectedEvent(event);
    setSelectedSlot(null);
    setShowModal(true);
  }, []);

  // Handle clicking on empty calendar slot
  const handleSelectSlot = useCallback((slotInfo) => {
    setSelectedEvent(null);
    setSelectedSlot(slotInfo);
    setShowModal(true);
  }, []);

  // Handle saving timesheet entry
  const handleSaveEntry = async (entryData) => {
    try {
      if (selectedEvent) {
        // Update existing entry
        await dispatch(updateEntry(selectedEvent.id, entryData));
      } else {
        // Create new entry
        await dispatch(createEntry(entryData));
      }
        setShowModal(false);
      setSelectedEvent(null);
      setSelectedSlot(null);
      
      // Refresh calendar events
      let startDate, endDate;
      switch (view) {
        case Views.DAY:
          startDate = moment(date).startOf('day').toISOString();
          endDate = moment(date).endOf('day').toISOString();
          break;
        case Views.WEEK:
          startDate = moment(date).startOf('week').toISOString();
          endDate = moment(date).endOf('week').toISOString();
          break;
        case Views.MONTH:
          startDate = moment(date).startOf('month').toISOString();
          endDate = moment(date).endOf('month').toISOString();
          break;
        default:
          startDate = moment(date).startOf('week').toISOString();
          endDate = moment(date).endOf('week').toISOString();
      }
      dispatch(fetchCalendarEvents(startDate, endDate));
    } catch (error) {
      console.error('Error saving entry:', error);
    }
  };
  // Handle deleting timesheet entry
  const handleDeleteEntry = async (entryId) => {
    try {
      await dispatch(deleteEntry(entryId));
      setShowModal(false);
      setSelectedEvent(null);
      
      // Refresh calendar events
      let startDate, endDate;
      switch (view) {
        case Views.DAY:
          startDate = moment(date).startOf('day').toISOString();
          endDate = moment(date).endOf('day').toISOString();
          break;
        case Views.WEEK:
          startDate = moment(date).startOf('week').toISOString();
          endDate = moment(date).endOf('week').toISOString();
          break;
        case Views.MONTH:
          startDate = moment(date).startOf('month').toISOString();
          endDate = moment(date).endOf('month').toISOString();
          break;
        default:
          startDate = moment(date).startOf('week').toISOString();
          endDate = moment(date).endOf('week').toISOString();
      }
      dispatch(fetchCalendarEvents(startDate, endDate));
    } catch (error) {
      console.error('Error deleting entry:', error);
    }
  };
  // Event style getter for color coding
  const eventStyleGetter = (event) => {
    const backgroundColor = event.backgroundColor || event.color || settings.colorScheme?.[event.resource?.category] || '#3174ad';
    return {
      style: {
        backgroundColor,
        borderRadius: '5px',
        opacity: 0.8,
        color: 'white',
        border: '0px',
        display: 'block'
      }
    };
  };
  // Custom event component
  const EventComponent = ({ event }) => (
    <div className="calendar-event">
      <strong>{event.title}</strong>
      {event.resource?.project && <div className="event-project">{event.resource.project}</div>}
      <div className="event-pay">${event.resource?.calculatedPay?.toFixed(2)}</div>
    </div>
  );

  // Custom toolbar component
  const CustomToolbar = ({ label, onNavigate, onView }) => (
    <div className="calendar-toolbar">
      <div className="calendar-nav">
        <button onClick={() => onNavigate('PREV')} className="nav-btn">
          ← Previous
        </button>
        <span className="calendar-label">{label}</span>
        <button onClick={() => onNavigate('NEXT')} className="nav-btn">
          Next →
        </button>
        <button onClick={() => onNavigate('TODAY')} className="today-btn">
          Today
        </button>
      </div>
      <div className="view-buttons">
        <button 
          onClick={() => onView(Views.DAY)}
          className={view === Views.DAY ? 'active' : ''}
        >
          Day
        </button>
        <button 
          onClick={() => onView(Views.WEEK)}
          className={view === Views.WEEK ? 'active' : ''}
        >
          Week
        </button>
        <button 
          onClick={() => onView(Views.MONTH)}
          className={view === Views.MONTH ? 'active' : ''}
        >
          Month
        </button>
      </div>
    </div>
  );

  if (loading) {
    return <div className="loading-spinner">Loading calendar...</div>;
  }

  if (error) {
    return <div className="error-message">Error: {error}</div>;
  }

  return (
    <div className="calendar-container">
      <div className="calendar-header">
        <h1>Timesheet Calendar</h1>
        <button 
          onClick={() => {
            setSelectedEvent(null);
            setSelectedSlot({ start: new Date(), end: moment().add(1, 'hour').toDate() });
            setShowModal(true);
          }}
          className="add-entry-btn"
        >
          + Add Entry
        </button>
      </div>
        <Calendar
        localizer={localizer}
        events={Array.isArray(calendarEvents) ? calendarEvents : []}
        startAccessor="start"
        endAccessor="end"
        style={{ height: 'calc(100vh - 200px)' }}
        onSelectEvent={handleSelectEvent}
        onSelectSlot={handleSelectSlot}
        selectable
        view={view}
        onView={setView}
        date={date}
        onNavigate={setDate}
        eventPropGetter={eventStyleGetter}
        components={{
          event: EventComponent,
          toolbar: CustomToolbar
        }}
        views={[Views.DAY, Views.WEEK, Views.MONTH]}
        step={15}
        timeslots={4}
        defaultView={Views.WEEK}
        min={new Date(2025, 0, 1, 6, 0)} // 6 AM
        max={new Date(2025, 0, 1, 22, 0)} // 10 PM
      />

      {showModal && (
        <TimesheetModal
          isOpen={showModal}
          onClose={() => {
            setShowModal(false);
            setSelectedEvent(null);
            setSelectedSlot(null);
          }}
          onSave={handleSaveEntry}
          onDelete={handleDeleteEntry}
          event={selectedEvent}
          slot={selectedSlot}
        />
      )}
    </div>
  );
};

export default CalendarView;
