import React, { useState, useEffect } from 'react'
import MiniCalendar from './MiniCalendar'
import googleCalendarService from '../services/googleCalendarService'
import './Sidebar.css'

const Sidebar = ({ 
  collapsed, 
  onCreateEvent, 
  onDateChange, 
  currentDate,
  onToggle,
  currentView,
  onViewChange,
  isGoogleConnected,
  googleUser,
  onGoogleSignIn,
  onGoogleSignOut,
  loading,
  onError
}) => {
  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-content">
        {!collapsed && (
          <>
            <button className="create-button" onClick={onCreateEvent}>
              <svg width="36" height="36" viewBox="0 0 36 36" className="create-icon">
                <path fill="#34a853" d="M16 16v14h4V20z"/>
                <path fill="#4285f4" d="M30 16v4H20z"/>
                <path fill="#34a853" d="M6 16v4h10z"/>
                <path fill="#fbbc04" d="M20 6v10h4z"/>
                <path fill="#ea4335" d="M20 6V2z"/>
                <path fill="#34a853" d="M16 6v4z"/>
              </svg>
              Create
            </button>
            
            <div className="mini-calendar-container">
              <MiniCalendar 
                currentDate={currentDate}
                onDateChange={onDateChange}
              />
            </div>
            
            <div className="sidebar-section">
              <div className="section-header">
                <h3>My calendars</h3>
              </div>
              <div className="calendar-list">
                <div className="calendar-item">
                  <div className="calendar-color" style={{ backgroundColor: '#1a73e8' }}></div>
                  <span className="calendar-name">Personal</span>
                </div>
                <div className="calendar-item">
                  <div className="calendar-color" style={{ backgroundColor: '#d93025' }}></div>
                  <span className="calendar-name">Work</span>
                </div>
                <div className="calendar-item">
                  <div className="calendar-color" style={{ backgroundColor: '#34a853' }}></div>
                  <span className="calendar-name">Family</span>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </aside>
  )
}

export default Sidebar