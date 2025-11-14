                                                                                                    import { gapi } from 'gapi-script'
import { GOOGLE_CALENDAR_CONFIG } from '../config/googleCalendar'

class GoogleCalendarService {
  constructor() {
    this.isSignedIn = false
    this.gapi = null
    this.initialized = false
    this.apiKeyOnly = false
    this.baseURL = 'http://localhost:5000/api'
  }

  // Initialize Google API (with API key only for public access)
  async initializeGapi() {
    if (this.initialized) return true

    try {
      await new Promise((resolve) => {
        gapi.load('client', resolve)
      })
      
      await gapi.client.init({
        apiKey: GOOGLE_CALENDAR_CONFIG.API_KEY,
        discoveryDocs: [GOOGLE_CALENDAR_CONFIG.DISCOVERY_DOC]
      })

      this.gapi = gapi
      this.initialized = true
      this.apiKeyOnly = true
      
      console.log('Google Calendar API initialized with API key')
      return true
    } catch (error) {
      console.error('Error initializing Google API:', error)
      return false
    }
  }

  // Initialize with OAuth (for private calendar access)
  async initializeWithAuth() {
    if (this.initialized && !this.apiKeyOnly) return true

    try {
      await new Promise((resolve) => {
        gapi.load('client:auth2', resolve)
      })
      
      await gapi.client.init({
        apiKey: GOOGLE_CALENDAR_CONFIG.API_KEY,
        clientId: GOOGLE_CALENDAR_CONFIG.CLIENT_ID,
        discoveryDocs: [GOOGLE_CALENDAR_CONFIG.DISCOVERY_DOC],
        scope: GOOGLE_CALENDAR_CONFIG.SCOPES
      })

      this.gapi = gapi
      this.initialized = true
      this.apiKeyOnly = false
      
      // Check if user is already signed in
      const authInstance = gapi.auth2.getAuthInstance()
      this.isSignedIn = authInstance.isSignedIn.get()
      
      console.log('Google Calendar API initialized with OAuth')
      return true
    } catch (error) {
      console.error('Error initializing Google API with auth:', error)
      return false
    }
  }

  // Sign in to Google
  async signIn() {
    if (!this.initialized || this.apiKeyOnly) {
      await this.initializeWithAuth()
    }

    try {
      const authInstance = this.gapi.auth2.getAuthInstance()
      await authInstance.signIn()
      this.isSignedIn = true
      return true
    } catch (error) {
      console.error('Error signing in:', error)
      return false
    }
  }

  // Sign out from Google
  async signOut() {
    if (!this.initialized || this.apiKeyOnly) return

    try {
      const authInstance = this.gapi.auth2.getAuthInstance()
      await authInstance.signOut()
      this.isSignedIn = false
      return true
    } catch (error) {
      console.error('Error signing out:', error)
      return false
    }
  }

  // Check if user is signed in
  isUserSignedIn() {
    if (!this.initialized || this.apiKeyOnly) return false
    const authInstance = this.gapi.auth2.getAuthInstance()
    return authInstance && authInstance.isSignedIn.get()
  }

  // Get access token for API calls
  getAccessToken() {
    if (!this.initialized || this.apiKeyOnly) return null
    const authInstance = this.gapi.auth2.getAuthInstance()
    if (authInstance && authInstance.isSignedIn.get()) {
      const user = authInstance.currentUser.get()
      return user.getAuthResponse().access_token
    }
    return null
  }

  // Get current user profile
  getCurrentUserProfile() {
    if (!this.initialized || this.apiKeyOnly) return null
    const authInstance = this.gapi.auth2.getAuthInstance()
    if (authInstance && authInstance.isSignedIn.get()) {
      const user = authInstance.currentUser.get()
      const profile = user.getBasicProfile()
      return {
        id: profile.getId(),
        name: profile.getName(),
        email: profile.getEmail(),
        imageUrl: profile.getImageUrl()
      }
    }
    return null
  }

  // Get public calendar events using API key
  async getPublicEvents(timeMin, timeMax, maxResults = 50, calendarId = null) {
    if (!this.initialized) {
      await this.initializeGapi()
    }

    try {
      const calId = calendarId || GOOGLE_CALENDAR_CONFIG.PUBLIC_CALENDAR_ID
      
      const response = await this.gapi.client.calendar.events.list({
        calendarId: calId,
        timeMin: timeMin,
        timeMax: timeMax,
        showDeleted: false,
        singleEvents: true,
        maxResults: maxResults,
        orderBy: 'startTime'
      })

      const events = response.result.items || []
      
      // Transform Google Calendar events to our format
      return events.map(event => ({
        id: `google_${event.id}`,
        title: event.summary || '(No title)',
        start: new Date(event.start?.dateTime || event.start?.date),
        end: new Date(event.end?.dateTime || event.end?.date),
        description: event.description || '',
        location: event.location || '',
        color: this.getEventColor(event.colorId),
        allDay: !event.start?.dateTime, // All-day if no specific time
        source: 'google',
        originalEvent: event,
        resource: {
          id: `google_${event.id}`,
          description: event.description || '',
          location: event.location || '',
          color: this.getEventColor(event.colorId),
          source: 'google',
          htmlLink: event.htmlLink,
          creator: event.creator?.displayName || event.creator?.email,
          attendees: event.attendees || []
        }
      }))
    } catch (error) {
      console.error('Error fetching Google Calendar public events:', error)
      return []
    }
  }

  // Sign in to Google
  async signIn() {
    if (!this.initialized) {
      await this.initializeGapi()
    }

    try {
      const authInstance = this.gapi.auth2.getAuthInstance()
      await authInstance.signIn()
      this.isSignedIn = true
      return true
    } catch (error) {
      console.error('Error signing in:', error)
      return false
    }
  }

  // Sign out from Google
  async signOut() {
    if (!this.initialized) return

    try {
      const authInstance = this.gapi.auth2.getAuthInstance()
      await authInstance.signOut()
      this.isSignedIn = false
      return true
    } catch (error) {
      console.error('Error signing out:', error)
      return false
    }
  }

  // Check if user is signed in
  isUserSignedIn() {
    if (!this.initialized) return false
    const authInstance = this.gapi.auth2.getAuthInstance()
    return authInstance && authInstance.isSignedIn.get()
  }

  // Get color for Google Calendar event
  getEventColor(colorId) {
    const colorMap = {
      '1': '#a4bdfc', // Lavender
      '2': '#7ae7bf', // Sage
      '3': '#dbadff', // Grape
      '4': '#ff887c', // Flamingo
      '5': '#fbd75b', // Banana
      '6': '#ffb878', // Tangerine
      '7': '#46d6db', // Peacock
      '8': '#e1e1e1', // Graphite
      '9': '#5484ed', // Blueberry
      '10': '#51b749', // Basil
      '11': '#dc2127'  // Tomato
    }
    return colorMap[colorId] || '#137333' // Default to green like in screenshot
  }

  // Get sample Indian holiday events (hardcoded for demo)
  async getSampleHolidayEvents(timeMin, timeMax) {
    const currentYear = new Date().getFullYear()
    
    const holidays = [
      {
        id: 'diwali-2024',
        summary: 'Diwali/Deepavali',
        start: { date: `${currentYear}-11-01` },
        end: { date: `${currentYear}-11-02` },
        description: 'Festival of Lights',
        colorId: '10'
      },
      {
        id: 'dussehra-2024',
        summary: 'Dussehra',
        start: { date: `${currentYear}-10-02` },
        end: { date: `${currentYear}-10-03` },
        description: 'Victory of good over evil',
        colorId: '10'
      },
      {
        id: 'karaka-chaturthi-2024',
        summary: 'Karaka Chaturthi',
        start: { date: `${currentYear}-11-10` },
        end: { date: `${currentYear}-11-11` },
        description: 'Hindu festival',
        colorId: '10'
      },
      {
        id: 'mahatma-gandhi-jayanti-2024',
        summary: 'Mahatma Gandhi Jayanti',
        start: { date: `${currentYear}-10-02` },
        end: { date: `${currentYear}-10-03` },
        description: 'Gandhi\'s birthday',
        colorId: '10'
      },
      {
        id: 'maha-navami-2024',
        summary: 'Maha Navami',
        start: { date: `${currentYear}-10-01` },
        end: { date: `${currentYear}-10-02` },
        description: 'Hindu festival',
        colorId: '10'
      },
      {
        id: 'maha-ashtami-2024',
        summary: 'Maha Ashtami',
        start: { date: `${currentYear}-09-30` },
        end: { date: `${currentYear}-10-01` },
        description: 'Hindu festival',
        colorId: '10'
      },
      {
        id: 'maha-saptami-2024',
        summary: 'Maha Saptami',
        start: { date: `${currentYear}-09-29` },
        end: { date: `${currentYear}-10-01` },
        description: 'Hindu festival',
        colorId: '10'
      },
      {
        id: 'maharishi-valmiki-jayanti-2024',
        summary: 'Maharishi Valmiki Jayanti',
        start: { date: `${currentYear}-10-07` },
        end: { date: `${currentYear}-10-08` },
        description: 'Valmiki\'s birthday',
        colorId: '10'
      },
      {
        id: 'govardhan-puja-2024',
        summary: 'Govardhan Puja',
        start: { date: `${currentYear}-11-22` },
        end: { date: `${currentYear}-11-23` },
        description: 'Hindu festival',
        colorId: '10'
      },
      {
        id: 'bhai-duj-2024',
        summary: 'Bhai Duj',
        start: { date: `${currentYear}-11-24` },
        end: { date: `${currentYear}-11-25` },
        description: 'Brother-sister festival',
        colorId: '10'
      },
      {
        id: 'chhath-puja-2024',
        summary: 'Chhath Puja (Pratihar Sashi)',
        start: { date: `${currentYear}-11-28` },
        end: { date: `${currentYear}-11-29` },
        description: 'Hindu festival dedicated to Sun God',
        colorId: '10'
      },
      {
        id: 'naraka-chaturdasi-2024',
        summary: 'Naraka Chaturdasi',
        start: { date: `${currentYear}-11-20` },
        end: { date: `${currentYear}-11-21` },
        description: 'Day before Diwali',
        colorId: '10'
      },
      {
        id: 'sports-day-2024',
        summary: 'Sports Day',
        start: { date: `${currentYear}-10-13` },
        end: { date: `${currentYear}-10-14` },
        description: 'Annual sports celebration',
        colorId: '9'
      }
    ]

    // Filter events within the requested time range
    const startTime = new Date(timeMin)
    const endTime = new Date(timeMax)
    
    return holidays
      .filter(event => {
        const eventDate = new Date(event.start.date)
        return eventDate >= startTime && eventDate <= endTime
      })
      .map(event => ({
        id: `holiday_${event.id}`,
        title: event.summary,
        start: new Date(event.start.date),
        end: new Date(event.end.date),
        description: event.description || '',
        location: 'India',
        color: this.getEventColor(event.colorId),
        allDay: true,
        source: 'google',
        originalEvent: event,
        resource: {
          id: `holiday_${event.id}`,
          description: event.description || '',
          location: 'India',
          color: this.getEventColor(event.colorId),
          source: 'google',
          creator: 'Indian Calendar',
          attendees: []
        }
      }))
  }

  // Get user's calendar list
  async getCalendarList() {
    if (!this.initialized || !this.isUserSignedIn()) {
      return []
    }

    try {
      const response = await this.gapi.client.calendar.calendarList.list()
      return response.result.items || []
    } catch (error) {
      console.error('Error fetching calendar list:', error)
      return []
    }
  }

  // Get user profile information
  async getUserProfile() {
    if (!this.initialized || !this.isUserSignedIn()) {
      return null
    }

    try {
      const authInstance = this.gapi.auth2.getAuthInstance()
      const user = authInstance.currentUser.get()
      const profile = user.getBasicProfile()
      
      return {
        id: profile.getId(),
        name: profile.getName(),
        email: profile.getEmail(),
        imageUrl: profile.getImageUrl()
      }
    } catch (error) {
      console.error('Error getting user profile:', error)
      return null
    }
  }

  // ===== LOCAL DATABASE API METHODS =====

  // Create event in local database
  async createLocalEvent(eventData) {
    try {
      const response = await fetch(`${this.baseURL}/events`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: eventData.title,
          description: eventData.description || '',
          location: eventData.location || '',
          start: eventData.start,
          end: eventData.end,
          allDay: eventData.allDay || false,
          color: eventData.color || '#1a73e8',
          userEmail: eventData.userEmail || '',
          remindersEnabled: eventData.remindersEnabled !== false
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const event = await response.json();
      return event;
    } catch (error) {
      console.error('Error creating local event:', error);
      throw error;
    }
  }

  // Get events from local database
  async getLocalEvents(startDate, endDate) {
    try {
      const params = new URLSearchParams();
      if (startDate) params.append('start', startDate.toISOString());
      if (endDate) params.append('end', endDate.toISOString());

      const response = await fetch(`${this.baseURL}/events?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const events = await response.json();
      
      // Transform to match calendar format
      return events.map(event => ({
        id: event._id,
        title: event.title,
        start: new Date(event.start),
        end: new Date(event.end),
        description: event.description,
        location: event.location,
        color: event.color,
        allDay: event.allDay,
        userEmail: event.userEmail,
        remindersEnabled: event.remindersEnabled,
        source: 'local',
        resource: {
          id: event._id,
          description: event.description,
          location: event.location,
          color: event.color,
          source: 'local',
          userEmail: event.userEmail,
          remindersEnabled: event.remindersEnabled
        }
      }));
    } catch (error) {
      console.error('Error fetching local events:', error);
      throw error;
    }
  }

  // Update event in local database
  async updateLocalEvent(eventId, eventData) {
    try {
      const response = await fetch(`${this.baseURL}/events/${eventId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: eventData.title,
          description: eventData.description || '',
          location: eventData.location || '',
          start: eventData.start,
          end: eventData.end,
          allDay: eventData.allDay || false,
          color: eventData.color || '#1a73e8',
          userEmail: eventData.userEmail || '',
          remindersEnabled: eventData.remindersEnabled !== false
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const event = await response.json();
      return event;
    } catch (error) {
      console.error('Error updating local event:', error);
      throw error;
    }
  }

  // Delete event from local database
  async deleteLocalEvent(eventId) {
    try {
      const response = await fetch(`${this.baseURL}/events/${eventId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error deleting local event:', error);
      throw error;
    }
  }

  // Get upcoming events from local database
  async getUpcomingLocalEvents(limit = 10) {
    try {
      const response = await fetch(`${this.baseURL}/events/upcoming?limit=${limit}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const events = await response.json();
      
      return events.map(event => ({
        id: event._id,
        title: event.title,
        start: new Date(event.start),
        end: new Date(event.end),
        description: event.description,
        location: event.location,
        color: event.color,
        allDay: event.allDay,
        userEmail: event.userEmail,
        remindersEnabled: event.remindersEnabled,
        source: 'local'
      }));
    } catch (error) {
      console.error('Error fetching upcoming local events:', error);
      throw error;
    }
  }

  // Get event statistics from local database
  async getLocalEventStats() {
    try {
      const response = await fetch(`${this.baseURL}/events/stats`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching local event stats:', error);
      throw error;
    }
  }

  // Get all reminders (for debugging)
  async getReminders() {
    try {
      const response = await fetch(`${this.baseURL}/reminders`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching reminders:', error);
      throw error;
    }
  }

  // Send test reminder
  async sendTestReminder(eventId, type = '1hour') {
    try {
      const response = await fetch(`${this.baseURL}/reminders/test/${eventId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ type })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error sending test reminder:', error);
      throw error;
    }
  }

  // Fetch Google Calendar events via backend API
  async getGoogleEventsViaBackend(start, end, maxResults = 50) {
    try {
      const accessToken = this.getAccessToken()
      if (!accessToken) {
        console.log('No access token available for Google Calendar API')
        return []
      }

      const startDate = start ? new Date(start).toISOString() : new Date().toISOString()
      const endDate = end ? new Date(end).toISOString() : undefined
      
      let url = `${this.baseURL}/google/events`
      const params = new URLSearchParams({
        accessToken,
        timeMin: startDate,
        maxResults: maxResults.toString()
      })
      
      if (endDate) params.append('timeMax', endDate)
      
      url += `?${params.toString()}`
      
      const response = await fetch(url)
      if (!response.ok) {
        if (response.status === 400) {
          console.log('Access token not provided or invalid')
          return []
        }
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const events = await response.json()
      
      // Transform events to ensure proper date objects
      return events.map(event => ({
        ...event,
        start: new Date(event.start),
        end: new Date(event.end),
        source: 'google'
      }))
    } catch (error) {
      console.error('Error fetching Google Calendar events via backend:', error)
      return []
    }
  }

  // Get recent Google Calendar events (authenticated)
  async getRecentEvents(timeMin, timeMax, maxResults = 50) {
    if (!this.initialized || this.apiKeyOnly) {
      await this.initializeWithAuth()
    }

    if (!this.isUserSignedIn()) {
      console.log('User not signed in to Google')
      return []
    }

    try {
      const response = await this.gapi.client.calendar.events.list({
        calendarId: 'primary',
        timeMin: timeMin,
        timeMax: timeMax,
        showDeleted: false,
        singleEvents: true,
        maxResults: maxResults,
        orderBy: 'startTime'
      })

      const events = response.result.items || []
      
      // Transform Google Calendar events to our format
      return events.map(event => ({
        id: `google_${event.id}`,
        title: event.summary || '(No title)',
        start: new Date(event.start?.dateTime || event.start?.date),
        end: new Date(event.end?.dateTime || event.end?.date),
        description: event.description || '',
        location: event.location || '',
        color: this.getEventColor(event.colorId),
        allDay: !event.start?.dateTime,
        source: 'google',
        originalEvent: event,
        resource: {
          id: `google_${event.id}`,
          description: event.description || '',
          location: event.location || '',
          color: this.getEventColor(event.colorId),
          source: 'google',
          htmlLink: event.htmlLink,
          creator: event.creator?.displayName || event.creator?.email,
          attendees: event.attendees || [],
          status: event.status,
          recurring: !!event.recurringEventId
        }
      }))
    } catch (error) {
      console.error('Error fetching Google Calendar recent events:', error)
      return []
    }
  }

  // Get all events (local + Google Calendar)
  async getAllEvents(start, end) {
    try {
      // Fetch both local events and Google Calendar events in parallel
      const [localEvents, googleEvents] = await Promise.all([
        this.getLocalEvents(start, end),
        this.getGoogleEventsViaBackend(start, end)
      ])

      // Combine and sort events by start time
      const allEvents = [...localEvents, ...googleEvents]
      allEvents.sort((a, b) => new Date(a.start) - new Date(b.start))

      console.log(`Fetched ${localEvents.length} local events and ${googleEvents.length} Google events`)
      return allEvents
    } catch (error) {
      console.error('Error fetching all events:', error)
      // Fallback to local events only
      return await this.getLocalEvents(start, end)
    }
  }
}

// Export singleton instance
export default new GoogleCalendarService()