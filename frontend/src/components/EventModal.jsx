import React, { useState, useEffect } from 'react'
import googleCalendarService from '../services/googleCalendarService'
import './EventModal.css'

const EventModal = ({ isOpen, onClose, eventData, slotData, onSuccess }) => {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [startDateTime, setStartDateTime] = useState('')
  const [endDateTime, setEndDateTime] = useState('')
  const [allDay, setAllDay] = useState(false)
  const [color, setColor] = useState('#1a73e8')
  const [location, setLocation] = useState('')
  const [userEmail, setUserEmail] = useState('')
  const [remindersEnabled, setRemindersEnabled] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState({})

  const isEditMode = !!eventData

  useEffect(() => {
    if (isOpen) {
      setErrors({})
      if (eventData) {
        // Edit mode - populate with existing event data
        setTitle(eventData.title || '')
        setDescription(eventData.description || '')
        setLocation(eventData.location || '')
        setStartDateTime(new Date(eventData.start).toISOString().slice(0, 16))
        setEndDateTime(new Date(eventData.end).toISOString().slice(0, 16))
        setAllDay(eventData.allDay || false)
        setColor(eventData.color || '#1a73e8')
        setUserEmail(eventData.userEmail || '')
        setRemindersEnabled(eventData.remindersEnabled !== false)
      } else if (slotData) {
        // Create mode - populate with selected slot data
        setTitle('')
        setDescription('')
        setLocation('')
        setUserEmail('')
        setRemindersEnabled(true)
        setStartDateTime(new Date(slotData.start).toISOString().slice(0, 16))
        setEndDateTime(new Date(slotData.end).toISOString().slice(0, 16))
        setAllDay(false)
        setColor('#1a73e8')
      } else {
        // Default create mode
        const now = new Date()
        const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000)
        setTitle('')
        setDescription('')
        setLocation('')
        setUserEmail('')
        setRemindersEnabled(true)
        setStartDateTime(now.toISOString().slice(0, 16))
        setEndDateTime(oneHourLater.toISOString().slice(0, 16))
        setAllDay(false)
        setColor('#1a73e8')
      }
    }
  }, [isOpen, eventData, slotData])

  const validateForm = () => {
    const newErrors = {}
    
    if (!title.trim()) {
      newErrors.title = 'Title is required'
    }
    
    if (!startDateTime) {
      newErrors.startDateTime = 'Start time is required'
    }
    
    if (!endDateTime) {
      newErrors.endDateTime = 'End time is required'
    }
    
    if (startDateTime && endDateTime && new Date(startDateTime) >= new Date(endDateTime)) {
      newErrors.endDateTime = 'End time must be after start time'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    console.log('Form submitted with data:', { title, startDateTime, endDateTime, allDay, color })
    
    if (!validateForm()) {
      console.log('Form validation failed')
      return
    }

    setIsSubmitting(true)

    try {
      const eventPayload = {
        title: title.trim(),
        description: description.trim(),
        location: location.trim(),
        start: new Date(startDateTime).toISOString(),
        end: new Date(endDateTime).toISOString(),
        allDay,
        color,
        userEmail: userEmail.trim(),
        remindersEnabled
      }

      console.log('Sending event payload:', eventPayload)

      if (isEditMode) {
        // Update existing event
        console.log('Updating event with ID:', eventData.id)
        await googleCalendarService.updateLocalEvent(eventData.id, eventPayload)
      } else {
        // Create new event
        console.log('Creating new event')
        const result = await googleCalendarService.createLocalEvent(eventPayload)
        console.log('Event created successfully:', result)
      }

      console.log('Calling onSuccess callback')
      // Small delay to ensure backend has processed the event
      setTimeout(() => {
        onSuccess()
      }, 100)
    } catch (error) {
      console.error('Error saving event:', error)
      setErrors({ general: 'Failed to save event. Please try again.' })
    } finally {
      setIsSubmitting(false)
    }
  }

  const colorOptions = [
    { value: '#1a73e8', name: 'Blue' },
    { value: '#d93025', name: 'Red' },
    { value: '#34a853', name: 'Green' },
    { value: '#fbbc04', name: 'Yellow' },
    { value: '#9aa0a6', name: 'Gray' },
    { value: '#ff6d01', name: 'Orange' },
    { value: '#9c27b0', name: 'Purple' },
    { value: '#795548', name: 'Brown' }
  ]

  const handleDelete = async () => {
    if (!isEditMode) return

    if (!window.confirm('Are you sure you want to delete this event?')) {
      return
    }

    setIsSubmitting(true)

    try {
      await googleCalendarService.deleteLocalEvent(eventData.id)
      onSuccess()
    } catch (error) {
      console.error('Error deleting event:', error)
      setErrors({ general: 'Failed to delete event. Please try again.' })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="header-left">
            <div className="event-color-indicator" style={{ backgroundColor: color }}></div>
            <h2>{isEditMode ? 'Edit Event' : 'New Event'}</h2>
          </div>
          <button className="close-button" onClick={onClose} type="button">
            <svg width="24" height="24" viewBox="0 0 24 24">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" fill="currentColor"/>
            </svg>
          </button>
        </div>
        
        {errors.general && (
          <div className="error-banner">
            {errors.general}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Add title"
              className={`title-input ${errors.title ? 'error' : ''}`}
            />
            {errors.title && <span className="error-text">{errors.title}</span>}
          </div>

          <div className="form-group">
            <div className="input-with-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" className="input-icon">
                <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z" fill="currentColor"/>
              </svg>
              <div className="datetime-inputs">
                <input
                  type="date"
                  value={startDateTime.split('T')[0]}
                  onChange={(e) => {
                    const time = startDateTime.split('T')[1] || '09:00'
                    setStartDateTime(`${e.target.value}T${time}`)
                  }}
                  className={errors.startDateTime ? 'error' : ''}
                />
                {!allDay && (
                  <>
                    <input
                      type="time"
                      value={startDateTime.split('T')[1] || '09:00'}
                      onChange={(e) => {
                        const date = startDateTime.split('T')[0]
                        setStartDateTime(`${date}T${e.target.value}`)
                      }}
                      className={errors.startDateTime ? 'error' : ''}
                    />
                    <span className="time-separator">–</span>
                    <input
                      type="time"
                      value={endDateTime.split('T')[1] || '10:00'}
                      onChange={(e) => {
                        const date = endDateTime.split('T')[0] || startDateTime.split('T')[0]
                        setEndDateTime(`${date}T${e.target.value}`)
                      }}
                      className={errors.endDateTime ? 'error' : ''}
                    />
                  </>
                )}
              </div>
            </div>
            {(errors.startDateTime || errors.endDateTime) && (
              <span className="error-text">{errors.startDateTime || errors.endDateTime}</span>
            )}
          </div>

          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={allDay}
                onChange={(e) => setAllDay(e.target.checked)}
              />
              <span className="checkmark"></span>
              All day
            </label>
          </div>

          <div className="form-group">
            <div className="input-with-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" className="input-icon">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="currentColor"/>
              </svg>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Add location"
              />
            </div>
          </div>

          <div className="form-group">
            <div className="input-with-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" className="input-icon">
                <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" fill="currentColor"/>
              </svg>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add description"
                rows={3}
              />
            </div>
          </div>

          <div className="form-group">
            <div className="input-with-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" className="input-icon">
                <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" fill="currentColor"/>
              </svg>
              <input
                type="email"
                value={userEmail}
                onChange={(e) => setUserEmail(e.target.value)}
                placeholder="Your email (for reminders)"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={remindersEnabled}
                onChange={(e) => setRemindersEnabled(e.target.checked)}
              />
              <span className="checkmark"></span>
              Send reminders (1 day and 1 hour before event)
            </label>
          </div>

          <div className="form-group">
            <label className="form-label">Color</label>
            <div className="color-picker">
              {colorOptions.map((colorOption) => (
                <button
                  key={colorOption.value}
                  type="button"
                  className={`color-option ${color === colorOption.value ? 'selected' : ''}`}
                  style={{ backgroundColor: colorOption.value }}
                  onClick={() => setColor(colorOption.value)}
                  title={colorOption.name}
                />
              ))}
            </div>
          </div>

          <div className="modal-actions">
            <div className="left-actions">
              {isEditMode && (
                <button
                  type="button"
                  className="delete-button"
                  onClick={handleDelete}
                  disabled={isSubmitting}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24">
                    <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" fill="currentColor"/>
                  </svg>
                  Delete
                </button>
              )}
            </div>
            <div className="right-actions">
              <button
                type="button"
                className="cancel-button"
                onClick={onClose}
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="save-button"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

export default EventModal