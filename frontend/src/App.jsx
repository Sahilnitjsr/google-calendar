import React, { useState, useEffect } from 'react';
import MyCalendar from './components/MyCalendar';
import EventModal from './components/EventModal';
import Sidebar from './components/Sidebar';
import MiniCalendar from './components/MiniCalendar';
import YearView from './components/YearView';
import googleCalendarService from './services/googleCalendarService';
import apiService from './services/apiService';
import './App.css';

function App() {
  // Modal and event state
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  
  // Calendar state
  const [refreshKey, setRefreshKey] = useState(0);
  const [currentView, setCurrentView] = useState('month');
  const [currentDate, setCurrentDate] = useState(new Date());
  
  // UI state
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showYearSelector, setShowYearSelector] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Google Calendar state
  const [isGoogleConnected, setIsGoogleConnected] = useState(false);
  const [googleUser, setGoogleUser] = useState(null);

  // Initialize Google Calendar service and check API health
  useEffect(() => {
    const initializeServices = async () => {
      setLoading(true);
      try {
        // Check API health
        const health = await apiService.checkHealth();
        if (health.status !== 'OK') {
          throw new Error(health.message || 'API is not available');
        }

        // Initialize Google Calendar service
        const initialized = await googleCalendarService.initialize();
        console.log('Google Calendar service initialized:', initialized);
      } catch (err) {
        console.error('Error initializing services:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    initializeServices();
  }, []);

  // Event handlers for calendar interactions
  const handleSelectSlot = (slotInfo) => {
    setSelectedSlot(slotInfo);
    setSelectedEvent(null);
    setModalOpen(true);
  };

  const handleSelectEvent = (event) => {
    setSelectedEvent(event);
    setSelectedSlot(null);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedEvent(null);
    setSelectedSlot(null);
    setError(null);
  };

  const handleRefreshCalendar = () => {
    setRefreshKey(prev => prev + 1);
    handleCloseModal();
  };

  // View and navigation handlers
  const handleViewChange = (view) => {
    setCurrentView(view);
  };

  const handleDateChange = (date) => {
    setCurrentDate(date);
  };

  const handleToggleSidebar = () => {
    setSidebarCollapsed(prev => !prev);
  };

  const handleToggleYearSelector = () => {
    setShowYearSelector(prev => !prev);
  };

  // Google Calendar handlers
  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      const success = await googleCalendarService.signIn();
      if (!success) {
        setError('Failed to sign in to Google Calendar');
      }
    } catch (err) {
      console.error('Error signing in to Google:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignOut = async () => {
    setLoading(true);
    try {
      const success = await googleCalendarService.signOut();
      if (!success) {
        setError('Failed to sign out from Google Calendar');
      }
    } catch (err) {
      console.error('Error signing out from Google:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Error handler
  const handleError = (error) => {
    console.error('App error:', error);
    setError(error.message || 'An unexpected error occurred');
  };

  // Clear error
  const clearError = () => {
    setError(null);
  };

  if (loading && !googleCalendarService.initialized) {
    return (
      <div className="app-loading">
        <div className="loading-spinner"></div>
        <p>Initializing Calendar App...</p>
      </div>
    );
  }

  return (
    <div className="App">
      {error && (
        <div className="error-banner">
          <span>{error}</span>
          <button onClick={clearError} className="error-close">×</button>
        </div>
      )}
      
      <div className="app-body">
        <Sidebar
          collapsed={sidebarCollapsed}
          onToggle={handleToggleSidebar}
          currentView={currentView}
          onViewChange={handleViewChange}
          currentDate={currentDate}
          onDateChange={handleDateChange}
          onCreateEvent={() => setModalOpen(true)}
          isGoogleConnected={isGoogleConnected}
          googleUser={googleUser}
          onGoogleSignIn={handleGoogleSignIn}
          onGoogleSignOut={handleGoogleSignOut}
          loading={loading}
          onError={handleError}
        />
        
        <main className={`main-content ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
          <div className="calendar-header">
            <div className="calendar-controls">
              <button
                className="sidebar-toggle"
                onClick={handleToggleSidebar}
                title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              >
                ☰
              </button>
              
              <div className="view-controls">
                <button
                  className={currentView === 'month' ? 'active' : ''}
                  onClick={() => handleViewChange('month')}
                >
                  Month
                </button>
                <button
                  className={currentView === 'week' ? 'active' : ''}
                  onClick={() => handleViewChange('week')}
                >
                  Week
                </button>
                <button
                  className={currentView === 'day' ? 'active' : ''}
                  onClick={() => handleViewChange('day')}
                >
                  Day
                </button>
                <button
                  className={currentView === 'year' ? 'active' : ''}
                  onClick={() => handleViewChange('year')}
                >
                  Year
                </button>
              </div>
            </div>
            
            <div className="date-navigation">
              <button onClick={() => setCurrentDate(new Date())}>
                Today
              </button>
              <button onClick={() => setRefreshKey(prev => prev + 1)} title="Refresh events">
                🔄
              </button>
              <h2 onClick={handleToggleYearSelector} className="current-date">
                {currentView === 'year' 
                  ? currentDate.getFullYear()
                  : currentDate.toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long' 
                    })
                }
              </h2>
            </div>
          </div>

          <div className="calendar-view">
            {currentView === 'year' ? (
              <YearView
                year={currentDate.getFullYear()}
                onMonthClick={(month) => {
                  const newDate = new Date(currentDate.getFullYear(), month, 1);
                  setCurrentDate(newDate);
                  setCurrentView('month');
                }}
                onSelectSlot={handleSelectSlot}
                onSelectEvent={handleSelectEvent}
                refreshKey={refreshKey}
                isGoogleConnected={isGoogleConnected}
                onError={handleError}
              />
            ) : (
              <MyCalendar
                view={currentView}
                date={currentDate}
                onSelectSlot={handleSelectSlot}
                onSelectEvent={handleSelectEvent}
                onNavigate={handleDateChange}
                onViewChange={handleViewChange}
                refreshKey={refreshKey}
                isGoogleConnected={isGoogleConnected}
                onError={handleError}
              />
            )}
          </div>
        </main>
      </div>

      {modalOpen && (
        <EventModal
          isOpen={modalOpen}
          onClose={handleCloseModal}
          eventData={selectedEvent}
          slotData={selectedSlot}
          onSuccess={handleRefreshCalendar}
        />
      )}

      {showYearSelector && (
        <div className="year-selector-overlay" onClick={handleToggleYearSelector}>
          <div className="year-selector" onClick={(e) => e.stopPropagation()}>
            <h3>Select Year</h3>
            <div className="year-options">
              {Array.from({ length: 21 }, (_, i) => {
                const year = new Date().getFullYear() - 10 + i;
                return (
                  <button
                    key={year}
                    className={year === currentDate.getFullYear() ? 'active' : ''}
                    onClick={() => {
                      const newDate = new Date(year, currentDate.getMonth(), 1);
                      setCurrentDate(newDate);
                      setShowYearSelector(false);
                    }}
                  >
                    {year}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {loading && (
        <div className="loading-overlay">
          <div className="loading-spinner"></div>
        </div>
      )}
    </div>
  );
}

export default App;