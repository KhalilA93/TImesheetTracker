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

  // Helper function to refresh calendar events for current view
  const refreshCalendarEvents = useCallback(() => {
    const { startDate, endDate } = getDateRange(date, view);
    console.log(`Refreshing calendar events for ${view} view:`, { 
      currentDate: date.toLocaleDateString(),
      startDate: new Date(startDate).toLocaleString(), 
      endDate: new Date(endDate).toLocaleString(),
      startDateISO: startDate,
      endDateISO: endDate
    });
    dispatch(fetchCalendarEvents(startDate, endDate));
  }, [dispatch, date, view]);

  // Fetch calendar events when view or date changes
  useEffect(() => {
    refreshCalendarEvents();
  }, [refreshCalendarEvents]);

  // Refresh calendar when entries change (e.g., after pay rate updates)
  useEffect(() => {
    // Refresh calendar events if we're on the calendar view and there might be updates
    const refreshCalendar = () => {
      const { startDate, endDate } = getDateRange(date, view);
      dispatch(fetchCalendarEvents(startDate, endDate));
    };

    // Listen for storage events that might indicate data changes
    const handleStorageChange = (e) => {
      if (e.key === 'payRateUpdated' || e.key === 'timesheetUpdated') {
        refreshCalendar();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
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
      console.log('Saving entry data:', entryData);
      
      let savedEntry;
      if (selectedEvent) {
        // Update existing entry
        savedEntry = await dispatch(updateEntry(selectedEvent.id, entryData));
      } else {
        // Create new entry - this will automatically add to calendar events via the action
        savedEntry = await dispatch(createEntry(entryData));
      }
      
      console.log('Entry saved successfully:', savedEntry);
      
      // Close modal
      setShowModal(false);
      setSelectedEvent(null);
      setSelectedSlot(null);
      
      // Force refresh the calendar events to ensure we have the latest data
      // Wait a bit longer to ensure backend processing is complete
      setTimeout(() => {
        console.log('Force refreshing calendar after save...');
        refreshCalendarEvents();
      }, 1000);
      
    } catch (error) {
      console.error('Error saving entry:', error);
      // Don't close modal on error so user can try again
    }
  };

  // Handle deleting timesheet entry
  const handleDeleteEntry = async (entryId) => {
    try {
      console.log('Deleting entry:', entryId);
      await dispatch(deleteEntry(entryId));
      
      console.log('Entry deleted successfully');
      
      // Close modal
      setShowModal(false);
      setSelectedEvent(null);
      
      // Force refresh to ensure deleted entry is removed from view
      setTimeout(() => {
        console.log('Force refreshing calendar after delete...');
        refreshCalendarEvents();
      }, 500);
      
    } catch (error) {
      console.error('Error deleting entry:', error);
    }
  };

  // Event style getter for color coding
  const eventStyleGetter = (event) => {
    // Get color based on category from settings or use default
    const categoryColors = {
      regular: '#3174ad',
      meeting: '#28a745',
      training: '#ffc107',
      travel: '#6f42c1',
      other: '#6c757d'
    };
    
    const backgroundColor = (settings.colorScheme && settings.colorScheme[event.category]) || 
                           categoryColors[event.category] || 
                           categoryColors.regular;
    
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
      <div className="event-details">
        <span className="event-hours">{event.hoursWorked?.toFixed(1)}h</span>
        {event.calculatedPay && (
          <span className="event-pay">${event.calculatedPay.toFixed(2)}</span>
        )}
      </div>
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
        events={Array.isArray(calendarEvents) ? calendarEvents.filter(event => {
          // Ensure event is valid and has required properties
          return event && 
                 event.start instanceof Date && 
                 event.end instanceof Date && 
                 !isNaN(event.start.getTime()) && 
                 !isNaN(event.end.getTime()) &&
                 event.title && // Ensure event has a title
                 typeof event.hoursWorked === 'number' && // Ensure hours is a number
                 typeof event.calculatedPay === 'number'; // Ensure pay is a number
        }) : []}
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
        formats={{
          timeGutterFormat: 'HH:mm',
          eventTimeRangeFormat: ({ start, end }) => {
            return `${moment(start).format('HH:mm')} - ${moment(end).format('HH:mm')}`;
          }
        }}
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
