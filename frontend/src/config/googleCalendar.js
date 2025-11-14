// Google Calendar API Configuration
export const GOOGLE_CALENDAR_CONFIG = {
  // Replace with your actual Google API key from https://console.developers.google.com/
  API_KEY: 'your-actual-api-key-here',
  
  // Your Google Calendar Client ID for OAuth
  CLIENT_ID: 'your-client-id.apps.googleusercontent.com',
  
  // Discovery URLs for Google Calendar API
  DISCOVERY_DOC: 'https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest',
  
  // Authorization scopes required by the web app
  SCOPES: 'https://www.googleapis.com/auth/calendar.readonly',
  
  // Calendar ID - 'primary' for user's primary calendar or specific calendar ID
  CALENDAR_ID: 'primary',
  
  // Public calendar ID for Indian holidays (example)
  PUBLIC_CALENDAR_ID: 'en.indian#holiday@group.v.calendar.google.com',
  
  // Alternative: Use a specific public calendar ID
  // PUBLIC_CALENDAR_ID: 'your-public-calendar-id@gmail.com'
}

// Instructions for setting up Google Calendar API:
/*
1. Go to https://console.developers.google.com/
2. Create a new project or select existing one
3. Enable Google Calendar API
4. Create credentials:
   - API Key for public data access
   - OAuth 2.0 Client ID for user authentication
5. Add your domain to authorized JavaScript origins
6. Replace the placeholder values above with your actual credentials
*/