import React, { useState, useEffect, useCallback } from 'react'
import { Calendar, momentLocalizer } from 'react-big-calendar'
import moment from 'moment'
import axios from 'axios'
import googleCalendarService from '../services/googleCalendarService'
import 'react-big-calendar/lib/css/react-big-calendar.css'
import './MyCalendar.css'

const localizer = momentLocalizer(moment)

const MyCalendar = ({ onSelectSlot, onSelectEvent, view, onViewChange, date, onNavigate, isGoogleConnected, refreshKey }) => {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(false)
  const [googleEvents, setGoogleEvents] = useState([])

  const fetchLocalEvents = useCallback(async (start, end) => {
    try {
      console.log('Calling googleCalendarService.getLocalEvents with:', { start, end })
      let events = await googleCalendarService.getLocalEvents(start, end)
      
      // If no events found with date filter, try getting all events
      if (events.length === 0) {
        console.log('No events found with date filter, trying to get all events')
        events = await googleCalendarService.getLocalEvents()
      }
      
      console.log('getLocalEvents returned:', events)
      return events
    } catch (error) {
      console.error('Error fetching local events:', error)
      return []
    }
  }, [])

  const fetchGoogleEvents = useCallback(async (start, end) => {
    try {
      const timeMin = start ? moment(start).toISOString() : null
      const timeMax = end ? moment(end).toISOString() : null
      
      // Always try to fetch sample holiday events
      return await googleCalendarService.getSampleHolidayEvents(timeMin, timeMax)
    } catch (error) {
      console.error('Error fetching Google events:', error)
      return []
    }
  }, [])

  const fetchAllEvents = useCallback(async (start, end) => {
    try {
      setLoading(true)
      
      console.log('Fetching events for range:', { start, end })
      
      // Fetch both local and Google events in parallel
      const [localEvents, googleEventsData] = await Promise.all([
        fetchLocalEvents(start, end),
        fetchGoogleEvents(start, end)
      ])
      
      console.log('Fetched local events:', localEvents)
      console.log('Fetched Google events:', googleEventsData)
      
      // Combine all events
      const allEvents = [...localEvents, ...googleEventsData]
      console.log('Combined events:', allEvents)
      setEvents(allEvents)
      
    } catch (error) {
      console.error('Error fetching events:', error)
    } finally {
      setLoading(false)
    }
  }, [fetchLocalEvents, fetchGoogleEvents])

  useEffect(() => {
    // Calculate the visible date range based on current view and date
    let start, end
    
    if (view === 'month') {
      start = moment(date).startOf('month').startOf('week')
      end = moment(date).endOf('month').endOf('week')
    } else if (view === 'week') {
      start = moment(date).startOf('week')
      end = moment(date).endOf('week')
    } else if (view === 'day') {
      start = moment(date).startOf('day')
      end = moment(date).endOf('day')
    }
    
    fetchAllEvents(start.toDate(), end.toDate())
  }, [fetchAllEvents, view, date, refreshKey])

  const handleNavigate = (newDate) => {
    onNavigate(newDate)
  }

  const handleViewChange = (newView) => {
    onViewChange(newView)
  }

  const handleSelectSlot = (slotInfo) => {
    onSelectSlot({
      start: slotInfo.start,
      end: slotInfo.end,
      action: slotInfo.action
    })
  }

  const handleSelectEvent = (event) => {
    // Don't allow editing Google Calendar events, just show info
    if (event.resource?.source === 'google') {
      // Could show a read-only info modal for Google events
      console.log('Google Calendar event:', event)
      return
    }
    onSelectEvent(event)
  }

  // Custom Event Component - Google Calendar style with view-aware rendering
  const EventComponent = ({ event, view: currentView }) => {
    const isAllDay = moment(event.end).diff(moment(event.start), 'hours') >= 24 ||
                     (moment(event.start).format('HH:mm') === '00:00' && 
                      moment(event.end).format('HH:mm') === '00:00')

    const isGoogleEvent = event.resource?.source === 'google'
    const startTime = moment(event.start).format('h:mm A')
    const endTime = moment(event.end).format('h:mm A')
    const location = event.resource?.location || event.location || ''
    const description = event.resource?.description || event.description || ''
    const tooltipText = `${event.title}${!isAllDay ? `\n${startTime} - ${endTime}` : ''}${description ? '\n' + description : ''}${location ? '\n📍 ' + location : ''}`
    
    // Adjust styling based on current view
    const getViewSpecificStyles = () => {
      const baseStyle = {
        backgroundColor: event.resource?.color || event.color || '#1a73e8',
        color: 'white',
        borderRadius: '4px',
        fontWeight: '500',
        overflow: 'hidden',
        cursor: 'pointer',
        border: 'none',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        fontFamily: 'Google Sans, Roboto, sans-serif',
        boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
        transition: 'all 0.2s ease',
        position: 'relative'
      }

      if (view === 'month') {
        return {
          ...baseStyle,
          padding: '2px 6px',
          fontSize: '11px',
          minHeight: '16px',
          lineHeight: '12px',
          margin: '1px 2px 1px 0'
        }
      } else if (view === 'week') {
        return {
          ...baseStyle,
          padding: '4px 8px',
          fontSize: '12px',
          minHeight: '20px',
          lineHeight: '14px',
          margin: '1px 2px',
          borderLeft: `3px solid ${event.resource?.color || event.color || '#0d47a1'}`
        }
      } else { // day view
        return {
          ...baseStyle,
          padding: '6px 10px',
          fontSize: '13px',
          minHeight: '24px',
          lineHeight: '16px',
          margin: '1px 4px 1px 0',
          borderLeft: `4px solid ${event.resource?.color || event.color || '#0d47a1'}`
        }
      }
    }
    
    return (
      <div 
        className={`custom-event ${isGoogleEvent ? 'google-event' : 'local-event'} ${view}-view-event`} 
        title={tooltipText}
        style={getViewSpecificStyles()}
      >
        <div className="event-title-row" style={{ 
          display: 'flex', 
          alignItems: 'center', 
          width: '100%',
          gap: view === 'month' ? '2px' : '4px'
        }}>
          {!isAllDay && view !== 'month' && (
            <span className="event-time" style={{ 
              opacity: 0.9, 
              fontSize: view === 'day' ? '11px' : '10px',
              fontWeight: '400',
              whiteSpace: 'nowrap'
            }}>
              {startTime}
            </span>
          )}
          <span className="event-title" style={{ 
            overflow: 'hidden', 
            textOverflow: 'ellipsis', 
            whiteSpace: 'nowrap', 
            flex: 1,
            fontWeight: '600'
          }}>{event.title}</span>
        </div>
        {location && view !== 'month' && (
          <div className="event-location" style={{
            fontSize: view === 'day' ? '11px' : '10px',
            opacity: 0.9,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            width: '100%',
            marginTop: '2px',
            fontWeight: '400'
          }}>
            📍 {location}
          </div>
        )}
        {description && view === 'day' && (
          <div className="event-description" style={{
            fontSize: '10px',
            opacity: 0.8,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            width: '100%',
            marginTop: '2px',
            fontWeight: '400'
          }}>
            {description}
          </div>
        )}
      </div>
    )
  }

  const eventStyleGetter = (event, start, end, isSelected) => {
    // Use event color if available, otherwise use default palette
    let backgroundColor = '#137333' // Default green for Google-style events
    
    if (event.resource?.color) {
      backgroundColor = event.resource.color
    } else if (event.color) {
      backgroundColor = event.color
    }
    
    const style = {
      backgroundColor,
      borderRadius: '4px',
      opacity: isSelected ? 1 : 0.9,
      color: 'white',
      border: 'none',
      display: 'block',
      fontSize: '12px',
      fontWeight: '500',
      padding: '4px 6px',
      boxShadow: isSelected ? '0 2px 4px rgba(0,0,0,0.2)' : '0 1px 2px rgba(0,0,0,0.1)',
      transition: 'all 0.2s ease',
      overflow: 'hidden'
    }
    return { style }
  }

  // Custom component for month date header with event count
  const MonthDateHeader = ({ label, date }) => {
    const cellDate = moment(date).format('YYYY-MM-DD')
    const dayEvents = events.filter(event => {
      const eventStart = moment(event.start).format('YYYY-MM-DD')
      const eventEnd = moment(event.end).format('YYYY-MM-DD')
      // Include events that start on this day OR span across this day
      return eventStart === cellDate || (eventStart <= cellDate && eventEnd >= cellDate)
    })

    console.log(`Date ${cellDate}: found ${dayEvents.length} events`, dayEvents)

    return (
      <div className="month-date-header">
        <span className="date-number">{label}</span>
        {dayEvents.length > 0 && (
          <span className="event-count" title={`${dayEvents.length} event${dayEvents.length > 1 ? 's' : ''}`}>
            {dayEvents.length}
          </span>
        )}
      </div>
    )
  }

  return (
    <div className="my-calendar">
      {loading && (
        <div className="calendar-loading">
          <div className="loading-spinner"></div>
        </div>
      )}
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: 'calc(100vh - 120px)', fontFamily: 'Google Sans, Roboto, sans-serif' }}
        view={view}
        onView={handleViewChange}
        date={date}
        onNavigate={handleNavigate}
        onSelectSlot={handleSelectSlot}
        onSelectEvent={handleSelectEvent}
        selectable={true}
        eventPropGetter={eventStyleGetter}
        views={['month', 'week', 'day']}
        step={30}
        timeslots={2}
        showMultiDayTimes
        popup
        popupOffset={30}
        tooltipAccessor="title"
        dayLayoutAlgorithm="no-overlap"
        min={new Date(2023, 0, 1, 6, 0, 0)} // 6 AM
        max={new Date(2023, 0, 1, 22, 0, 0)} // 10 PM
        scrollToTime={new Date(2023, 0, 1, 8, 0, 0)} // 8 AM
        messages={{
          next: "Next",
          previous: "Previous",
          today: "Today",
          month: "Month",
          week: "Week",
          day: "Day",
          agenda: "Agenda",
          date: "Date",
          time: "Time",
          event: "Event",
          noEventsInRange: "No events in this range.",
          showMore: total => `+${total} more`
        }}
        formats={{
          monthHeaderFormat: 'MMMM YYYY',
          dayHeaderFormat: 'dddd, MMMM Do',
          dayRangeHeaderFormat: ({ start, end }, culture, localizer) =>
            localizer.format(start, 'MMMM Do', culture) + ' – ' + localizer.format(end, 'MMMM Do, YYYY', culture),
          agendaDateFormat: 'ddd MMM Do',
          agendaTimeFormat: 'h:mm A',
          agendaTimeRangeFormat: ({ start, end }, culture, localizer) =>
            localizer.format(start, 'h:mm A', culture) + ' – ' + localizer.format(end, 'h:mm A', culture)
        }}
        components={{
          toolbar: () => null, // Hide default toolbar since we have our own
          event: (props) => <EventComponent {...props} view={view} />, // Use custom event component with view
          month: {
            dateHeader: MonthDateHeader
          }
        }}
      />
    </div>
  )
}

export default MyCalendar