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

  // Helper function to get date range for current view
  const getDateRange = (currentDate, currentView) => {
    let startDate, endDate;
    
    switch (currentView) {
      case Views.DAY:
        const dayStart = new Date(currentDate);
        dayStart.setHours(0, 0, 0, 0);
        const dayEnd = new Date(currentDate);
        dayEnd.setHours(23, 59, 59, 999);
        startDate = dayStart.toISOString();
        endDate = dayEnd.toISOString();
        break;
      case Views.WEEK:
        const weekStart = new Date(currentDate);
        weekStart.setDate(currentDate.getDate() - currentDate.getDay());
        weekStart.setHours(0, 0, 0, 0);
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        weekEnd.setHours(23, 59, 59, 999);
        startDate = weekStart.toISOString();
        endDate = weekEnd.toISOString();
        break;
      case Views.MONTH:
        const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        monthStart.setHours(0, 0, 0, 0);
        const monthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
        monthEnd.setHours(23, 59, 59, 999);
        startDate = monthStart.toISOString();
        endDate = monthEnd.toISOString();
        break;
      default:
        const defaultWeekStart = new Date(currentDate);
        defaultWeekStart.setDate(currentDate.getDate() - currentDate.getDay());
        defaultWeekStart.setHours(0, 0, 0, 0);
        const defaultWeekEnd = new Date(defaultWeekStart);
        defaultWeekEnd.setDate(defaultWeekStart.getDate() + 6);
        defaultWeekEnd.setHours(23, 59, 59, 999);
        startDate = defaultWeekStart.toISOString();
        endDate = defaultWeekEnd.toISOString();
    }
      return { startDate, endDate };
  };

  // Fetch calendar events when view or date changes
  useEffect(() => {
    const { startDate, endDate } = getDateRange(date, view);
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
      }      setShowModal(false);
      setSelectedEvent(null);
      setSelectedSlot(null);
      
      // Refresh calendar events
      const { startDate, endDate } = getDateRange(date, view);
      dispatch(fetchCalendarEvents(startDate, endDate));
    } catch (error) {
      console.error('Error saving entry:', error);
    }
  };
  // Handle deleting timesheet entry
  const handleDeleteEntry = async (entryId) => {
    try {
      await dispatch(deleteEntry(entryId));      setShowModal(false);
      setSelectedEvent(null);
      
      // Refresh calendar events
      const { startDate, endDate } = getDateRange(date, view);
      dispatch(fetchCalendarEvents(startDate, endDate));
    } catch (error) {
      console.error('Error deleting entry:', error);
    }
  };

  // Event style getter for color coding
  const eventStyleGetter = (event) => {
    const backgroundColor = event.color || settings.colorScheme[event.category] || '#3174ad';
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
      {event.project && <div className="event-project">{event.project}</div>}
      <div className="event-pay">${event.calculatedPay?.toFixed(2)}</div>
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
        <h1>Timesheet Calendar</h1>        <button 
          onClick={() => {
            setSelectedEvent(null);
            const currentTime = new Date();
            const oneHourLater = new Date(currentTime.getTime() + 60 * 60 * 1000);
            setSelectedSlot({ start: currentTime, end: oneHourLater });
            setShowModal(true);
          }}
          className="add-entry-btn"
        >
          + Add Entry
        </button>
      </div>      <Calendar
        localizer={localizer}
        events={Array.isArray(calendarEvents) ? calendarEvents.filter(event => 
          event && 
          event.start instanceof Date && 
          event.end instanceof Date && 
          !isNaN(event.start.getTime()) && 
          !isNaN(event.end.getTime())
        ) : []}
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
