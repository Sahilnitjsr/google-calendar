import React from 'react'
import moment from 'moment'
import './YearView.css'

const YearView = ({ year, onMonthClick, onSelectSlot, onSelectEvent, refreshKey, isGoogleConnected, onError }) => {
  const currentYear = year || new Date().getFullYear()
  
  const months = [
    'January', 'February', 'March', 'April',
    'May', 'June', 'July', 'August', 
    'September', 'October', 'November', 'December'
  ]

  const renderMonthGrid = (monthIndex) => {
    const monthDate = new Date(currentYear, monthIndex, 1)
    const daysInMonth = new Date(currentYear, monthIndex + 1, 0).getDate()
    const startDay = monthDate.getDay()
    const today = new Date()
    const isCurrentMonth = monthIndex === today.getMonth() && currentYear === today.getFullYear()
    const todayDate = today.getDate()

    const days = []
    const weekdays = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

    // Header with weekdays
    weekdays.forEach(day => {
      days.push(
        <div key={`${monthIndex}-header-${day}`} className="year-day-header">
          {day}
        </div>
      )
    })

    // Previous month's trailing days
    const prevMonth = monthIndex === 0 ? 11 : monthIndex - 1
    const prevYear = monthIndex === 0 ? currentYear - 1 : currentYear
    const daysInPrevMonth = new Date(prevYear, prevMonth + 1, 0).getDate()
    
    for (let i = startDay - 1; i >= 0; i--) {
      days.push(
        <div key={`${monthIndex}-prev-${daysInPrevMonth - i}`} className="year-day other-month">
          {daysInPrevMonth - i}
        </div>
      )
    }

    // Current month days
    for (let day = 1; day <= daysInMonth; day++) {
      const isToday = isCurrentMonth && day === todayDate
      
      days.push(
        <div 
          key={`${monthIndex}-${day}`} 
          className={`year-day ${isToday ? 'today' : ''}`}
          onClick={() => {
            if (onMonthClick) {
              onMonthClick(monthIndex)
            }
          }}
        >
          {day}
        </div>
      )
    }

    // Next month's leading days
    const totalCells = days.length
    const remainingCells = 42 - totalCells // 6 rows × 7 days
    
    for (let day = 1; day <= remainingCells; day++) {
      days.push(
        <div key={`${monthIndex}-next-${day}`} className="year-day other-month">
          {day}
        </div>
      )
    }

    return (
      <div className="year-month" key={monthIndex}>
        <div className="year-month-header">
          <h3>{months[monthIndex]}</h3>
        </div>
        <div className="year-month-grid">
          {days}
        </div>
      </div>
    )
  }

  return (
    <div className="year-view">
      <div className="year-grid">
        {months.map((_, index) => renderMonthGrid(index))}
      </div>
    </div>
  )
}

export default YearView