import React, { useState, useEffect } from 'react'
import moment from 'moment'
import './MiniCalendar.css'

const MiniCalendar = ({ currentDate, onDateChange }) => {
  const [displayDate, setDisplayDate] = useState(moment(currentDate))
  const [showYearSelector, setShowYearSelector] = useState(false)
  
  useEffect(() => {
    setDisplayDate(moment(currentDate))
  }, [currentDate])

  const navigateMonth = (direction) => {
    const newDate = moment(displayDate).add(direction, 'month')
    setDisplayDate(newDate)
  }

  const navigateYear = (direction) => {
    const newDate = moment(displayDate).add(direction, 'year')
    setDisplayDate(newDate)
  }

  const selectYear = (year) => {
    const newDate = moment(displayDate).year(year)
    setDisplayDate(newDate)
    setShowYearSelector(false)
  }

  const toggleYearSelector = () => {
    setShowYearSelector(!showYearSelector)
  }

  const getYearRange = () => {
    const currentYear = displayDate.year()
    const years = []
    for (let year = currentYear - 10; year <= currentYear + 10; year++) {
      years.push(year)
    }
    return years
  }

  const selectDate = (date) => {
    onDateChange(date.toDate())
  }

  const renderCalendarGrid = () => {
    const startOfMonth = moment(displayDate).startOf('month')
    const endOfMonth = moment(displayDate).endOf('month')
    const startOfWeek = moment(startOfMonth).startOf('week')
    const endOfWeek = moment(endOfMonth).endOf('week')
    
    const days = []
    const currentMoment = moment(startOfWeek)
    const today = moment()
    
    while (currentMoment <= endOfWeek) {
      const day = moment(currentMoment)
      const isCurrentMonth = day.month() === displayDate.month()
      const isToday = day.isSame(today, 'day')
      const isSelected = day.isSame(moment(currentDate), 'day') && !isToday
      
      days.push(
        <button
          key={day.format('YYYY-MM-DD')}
          className={`mini-day ${!isCurrentMonth ? 'other-month' : ''} ${isToday ? 'today' : ''} ${isSelected ? 'selected' : ''}`}
          onClick={() => selectDate(day)}
        >
          {day.date()}
        </button>
      )
      
      currentMoment.add(1, 'day')
    }
    
    return days
  }

  const weekDays = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

  return (
    <div className="mini-calendar">
      <div className="mini-calendar-header">
        <button 
          className="mini-nav-button"
          onClick={() => navigateMonth(-1)}
          aria-label="Previous month"
        >
          <svg width="16" height="16" viewBox="0 0 24 24">
            <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" fill="currentColor"/>
          </svg>
        </button>
        
        <h4 className="mini-calendar-title">
          {displayDate.format('MMMM YYYY')}
        </h4>
        
        <button 
          className="mini-nav-button"
          onClick={() => navigateMonth(1)}
          aria-label="Next month"
        >
          <svg width="16" height="16" viewBox="0 0 24 24">
            <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" fill="currentColor"/>
          </svg>
        </button>
      </div>
      
      <div className="mini-calendar-weekdays">
        {weekDays.map((day, index) => (
          <div key={index} className="mini-weekday">
            {day}
          </div>
        ))}
      </div>
      
      <div className="mini-calendar-grid">
        {renderCalendarGrid()}
      </div>
    </div>
  )
}

export default MiniCalendar