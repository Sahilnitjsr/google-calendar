# Google Calendar Clone

A modern, full-featured calendar application built with React, Node.js, and MongoDB, featuring event management, automated reminders, and a responsive Google Calendar-inspired interface.

[![GitHub Repository](https://img.shields.io/badge/GitHub-google--calendar-blue?logo=github)](https://github.com/Sahilnitjsr/google-calendar)
![Google Calendar Clone](https://img.shields.io/badge/Version-1.0.0-blue)
![MongoDB](https://img.shields.io/badge/Database-MongoDB-green)
![React](https://img.shields.io/badge/Frontend-React-blue)
![Node.js](https://img.shields.io/badge/Backend-Node.js-green)
![License](https://img.shields.io/badge/License-MIT-yellow)

## 🚀 Features

- **📅 Multiple Calendar Views**: Month, Week, and Day views with smooth transitions
- **📝 Event Management**: Create, edit, delete events with rich details
- **⏰ Automated Reminders**: Email notifications 1 day and 1 hour before events
- **🎨 Google Calendar UI**: Authentic Google Calendar design and interactions
- **📱 Responsive Design**: Works seamlessly on desktop and mobile devices
- **🌍 Year View**: Navigate through years with holiday integration
- **📍 Location Support**: Add and display event locations
- **🔔 Smart Notifications**: Configurable reminder system
- **💾 Persistent Storage**: MongoDB database for reliable data storage

## 🚀 Quick Start

```bash
# Clone the repository
git clone https://github.com/Sahilnitjsr/google-calendar.git
cd google-calendar

# Install dependencies
npm install
cd frontend && npm install
cd ../backend && npm install

# Set up environment variables
cp backend/.env.example backend/.env

# Start MongoDB (ensure it's running)
# Windows: net start MongoDB
# macOS: brew services start mongodb-community
# Linux: sudo systemctl start mongod

# Start the application
# Terminal 1 - Backend
cd backend && npm start

# Terminal 2 - Frontend
cd frontend && npm run dev
```

Visit `http://localhost:3000` to access the application.

## 📋 Prerequisites

- **Node.js** (v16.0.0 or higher)
- **MongoDB** (v5.0 or higher)  
- **npm** or **yarn** package manager
- Modern web browser (Chrome, Firefox, Safari, Edge)

### System Requirements

- **RAM**: Minimum 4GB, Recommended 8GB
- **Storage**: At least 1GB free space
- **Network**: Internet connection for Google Calendar integration (optional)

## 🔧 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/Sahilnitjsr/google-calendar.git
cd google-calendar
```     

### 2. Install Root Dependencies

```bash
npm install
```

### 3. Install Frontend Dependencies

```bash
cd frontend
npm install
cd ..
```

### 4. Install Backend Dependencies

```bash
cd backend
npm install
cd ..
```

### 5. MongoDB Setup

#### Option A: Local MongoDB Installation

**Windows:**
```bash
# Download from https://www.mongodb.com/try/download/community
# Install and start as service
net start MongoDB
```

**macOS:**
```bash
# Using Homebrew
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

**Linux (Ubuntu):**
```bash
# Install MongoDB
sudo apt-get update
sudo apt-get install -y mongodb-org
sudo systemctl start mongod
sudo systemctl enable mongod
```

#### Option B: MongoDB Atlas (Cloud)

1. Create account at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a new cluster
3. Get connection string
4. Update `MONGODB_URI` in `.env` file

## ⚙️ Configuration

### Environment Variables

Create `backend/.env` file:

```env
# Database Configuration
MONGODB_URI=mongodb://localhost:27017/google-calendar-clone

# Server Configuration
PORT=5000
NODE_ENV=development

# Email Configuration for Reminders
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM=noreply@calendar-app.com

# Optional: Google Calendar Integration
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

### Email Setup (Gmail)

1. Enable 2-Factor Authentication on Gmail
2. Generate App Password:
   - Go to Google Account Settings → Security → App passwords
   - Generate password for "Mail"
   - Use this password in `EMAIL_PASS`

### Alternative Email Providers

**SendGrid:**
```env
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_USER=apikey
EMAIL_PASS=your-sendgrid-api-key
```

**Mailgun:**
```env
EMAIL_HOST=smtp.mailgun.org
EMAIL_PORT=587
EMAIL_USER=your-mailgun-username
EMAIL_PASS=your-mailgun-password
```

## 🏃‍♂️ Running the Application

### Development Mode

**Option 1: Separate Terminals**

```bash
# Terminal 1 - Backend
cd backend
npm run dev  # Uses nodemon for auto-restart

# Terminal 2 - Frontend
cd frontend
npm run dev  # Uses Vite dev server
```

**Option 2: Root Level Scripts**

```bash
# Start both frontend and backend
npm run dev

# Start only backend
npm run server

# Start only frontend
npm run client
```

### Production Mode

```bash
# Build frontend
cd frontend
npm run build

# Start backend in production
cd ../backend
NODE_ENV=production npm start
```

### Docker Deployment

```bash
# Build and run with Docker Compose
docker-compose up --build
```

## 🏗️ Architecture

### System Overview

```
┌─────────────────┐    HTTP/REST    ┌─────────────────┐    MongoDB     ┌─────────────────┐
│                 │ ◄──────────────► │                 │ ◄─────────────► │                 │
│   React Client  │                 │   Node.js API   │                │   MongoDB DB    │
│                 │                 │                 │                │                 │
└─────────────────┘                 └─────────────────┘                └─────────────────┘
        │                                     │                                  │
        │                                     │                                  │
        ▼                                     ▼                                  ▼
┌─────────────────┐                 ┌─────────────────┐                ┌─────────────────┐
│   Components    │                 │   Controllers   │                │   Collections   │
│ • MyCalendar    │                 │ • Event CRUD    │                │ • events        │
│ • EventModal    │                 │ • Reminders     │                │ • reminders     │
│ • Sidebar       │                 │ • Email Service │                │                 │
└─────────────────┘                 └─────────────────┘                └─────────────────┘
```

### Frontend Architecture

**Component Hierarchy:**
```
App
├── Header (Navigation, View Selector)
├── Sidebar (Mini Calendar, Create Event)
├── Main Content
│   ├── YearView (Year Navigation)
│   ├── MyCalendar (Month/Week/Day Views)
│   │   ├── EventComponent (Custom Event Rendering)
│   │   └── MonthDateHeader (Date Display)
│   └── EventModal (Event Creation/Editing)
└── Services
    ├── googleCalendarService (API Integration)
    └── Event Management Functions
```

### Backend Architecture

**API Layer Structure:**
```
server.js
├── Express Configuration
├── MongoDB Connection
├── Middleware Setup
├── Routes
│   ├── Event Routes (/api/events)
│   ├── Reminder Routes (/api/reminders)
│   └── Health Check (/api/health)
├── Models
│   ├── Event Schema
│   └── Reminder Schema
├── Services
│   ├── Email Service (Nodemailer)
│   ├── Reminder Scheduler (Cron)
│   └── Event Management
└── Error Handling
```

### Data Flow

1. **Event Creation:**
   - User fills EventModal form
   - Frontend validates input
   - API call to `/api/events` (POST)
   - Backend creates event in MongoDB
   - Backend schedules reminders
   - Frontend refreshes calendar view

2. **Event Display:**
   - Calendar component requests events
   - API call to `/api/events` (GET) with date range
   - Backend queries MongoDB
   - Events transformed for calendar format
   - Events rendered in calendar view

3. **Reminder System:**
   - Cron job runs every minute
   - Queries pending reminders
   - Sends email notifications
   - Marks reminders as sent

## 💻 Technology Stack

### Frontend Technologies

| Technology | Version | Purpose |
|------------|---------|---------|
| **React** | ^18.2.0 | UI Framework |
| **Vite** | ^4.4.5 | Build Tool & Dev Server |
| **React Big Calendar** | ^1.8.2 | Calendar Component |
| **Moment.js** | ^2.29.4 | Date Manipulation |
| **Axios** | ^1.5.0 | HTTP Client |
| **CSS3** | - | Styling & Animations |

**Why React?**
- Component-based architecture for reusability
- Large ecosystem and community support
- Excellent performance with virtual DOM
- Strong TypeScript support for future migration

**Why Vite?**
- Faster build times compared to Create React App
- Hot Module Replacement (HMR)
- Modern ES modules support
- Optimized production builds

### Backend Technologies

| Technology | Version | Purpose |
|------------|---------|---------|
| **Node.js** | ^18.0.0 | Runtime Environment |
| **Express.js** | ^4.18.2 | Web Framework |
| **MongoDB** | ^5.0 | Database |
| **Mongoose** | ^8.19.3 | ODM for MongoDB |
| **Nodemailer** | ^6.9.0 | Email Service |
| **Node-Cron** | ^3.0.0 | Task Scheduling |
| **CORS** | ^2.8.5 | Cross-Origin Resource Sharing |

**Why Node.js?**
- JavaScript across full stack
- Non-blocking I/O for real-time features
- Large package ecosystem (npm)
- Excellent for API development

**Why MongoDB?**
- Flexible schema for evolving event structures
- Excellent performance for read-heavy workloads
- Built-in replication and sharding
- JSON-like documents match JavaScript objects

### Development Tools

| Tool | Purpose |
|------|---------|
| **ESLint** | Code Quality & Standards |
| **Prettier** | Code Formatting |
| **Nodemon** | Backend Auto-restart |
| **Git** | Version Control |
| **VS Code** | Development Environment |

## 🧠 Business Logic

### Event Management

#### Event Creation Logic

```javascript
// Event validation rules
const validateEvent = (eventData) => {
  const errors = {};
  
  // Required fields
  if (!eventData.title?.trim()) {
    errors.title = 'Title is required';
  }
  
  if (!eventData.start) {
    errors.start = 'Start time is required';
  }
  
  if (!eventData.end) {
    errors.end = 'End time is required';
  }
  
  // Business rules
  if (new Date(eventData.start) >= new Date(eventData.end)) {
    errors.time = 'End time must be after start time';
  }
  
  // Email validation for reminders
  if (eventData.remindersEnabled && eventData.userEmail) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(eventData.userEmail)) {
      errors.email = 'Valid email required for reminders';
    }
  }
  
  return errors;
};
```

#### Reminder Scheduling Logic

```javascript
const createReminders = async (event) => {
  if (!event.remindersEnabled) return;

  const eventStart = new Date(event.start);
  const now = new Date();
  
  // Calculate reminder times
  const oneDayBefore = new Date(eventStart.getTime() - 24 * 60 * 60 * 1000);
  const oneHourBefore = new Date(eventStart.getTime() - 60 * 60 * 1000);
  
  const reminders = [];
  
  // Only create future reminders
  if (oneDayBefore > now) {
    reminders.push({
      eventId: event._id,
      type: '1day',
      scheduledTime: oneDayBefore
    });
  }
  
  if (oneHourBefore > now) {
    reminders.push({
      eventId: event._id,
      type: '1hour',
      scheduledTime: oneHourBefore
    });
  }
  
  if (reminders.length > 0) {
    await Reminder.insertMany(reminders);
  }
};
```

### Edge Cases Handled

#### 1. **Time Zone Handling**
```javascript
// All times stored in UTC, converted for display
const displayTime = (utcTime, userTimezone) => {
  return moment(utcTime).tz(userTimezone).format('YYYY-MM-DD HH:mm');
};
```

#### 2. **Overlapping Events**
- **Detection**: Check for events with overlapping time ranges
- **Display**: Use calendar's built-in overlap resolution
- **Creation**: Allow overlaps but warn users

#### 3. **All-Day Events**
```javascript
const isAllDay = (event) => {
  const start = moment(event.start);
  const end = moment(event.end);
  
  return start.format('HH:mm') === '00:00' && 
         end.format('HH:mm') === '00:00' &&
         end.diff(start, 'hours') >= 24;
};
```

#### 4. **Cross-Day Events**
- Events spanning multiple days are properly handled
- Calendar displays events across date boundaries
- Reminders account for multi-day events

#### 5. **Database Connection Failures**
```javascript
// Graceful degradation and retry logic
const handleDbError = async (operation, retries = 3) => {
  try {
    return await operation();
  } catch (error) {
    if (retries > 0 && error.name === 'MongoNetworkError') {
      await new Promise(resolve => setTimeout(resolve, 1000));
      return handleDbError(operation, retries - 1);
    }
    throw error;
  }
};
```

#### 6. **Email Delivery Failures**
```javascript
const sendReminderWithRetry = async (reminder, retries = 3) => {
  try {
    await sendEmail(reminder);
    await markReminderSent(reminder._id);
  } catch (error) {
    if (retries > 0) {
      // Exponential backoff
      const delay = Math.pow(2, 3 - retries) * 1000;
      setTimeout(() => sendReminderWithRetry(reminder, retries - 1), delay);
    } else {
      await logFailedReminder(reminder._id, error);
    }
  }
};
```

### Data Validation & Sanitization

#### Frontend Validation
- Real-time input validation
- Date/time format verification
- Email format checking
- Required field enforcement

#### Backend Validation
- Mongoose schema validation
- Input sanitization
- SQL injection prevention
- XSS protection

## 🎨 Animations & Interactions

### CSS Animations

#### 1. **Loading Spinner**
```css
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-spinner {
  animation: spin 1s linear infinite;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #1a73e8;
  border-radius: 50%;
}
```

#### 2. **Event Hover Effects**
```css
.custom-event {
  transition: all 0.2s ease;
  box-shadow: 0 1px 2px rgba(0,0,0,0.1);
}

.custom-event:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0,0,0,0.15);
  opacity: 0.95;
}
```

#### 3. **Modal Transitions**
```css
.modal-overlay {
  animation: fadeIn 0.2s ease-out;
}

.modal-content {
  animation: slideUp 0.3s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from { 
    opacity: 0;
    transform: translateY(20px);
  }
  to { 
    opacity: 1;
    transform: translateY(0);
  }
}
```

### Interactive Elements

#### 1. **Calendar Navigation**
- Smooth view transitions (Month ↔ Week ↔ Day)
- Date picker with keyboard navigation
- Touch/swipe support for mobile

#### 2. **Event Creation**
- Click empty slot to create event
- Drag to select time range
- Auto-focus on title field

#### 3. **Event Editing**
- Click event to edit
- Inline editing for quick changes
- Keyboard shortcuts (Enter to save, Esc to cancel)

#### 4. **Responsive Interactions**
```javascript
// Touch event handling for mobile
const handleTouchStart = (e) => {
  const touch = e.touches[0];
  setTouchStart({
    x: touch.clientX,
    y: touch.clientY,
    time: Date.now()
  });
};

const handleTouchEnd = (e) => {
  const touch = e.changedTouches[0];
  const deltaX = touch.clientX - touchStart.x;
  const deltaTime = Date.now() - touchStart.time;
  
  // Swipe detection
  if (Math.abs(deltaX) > 50 && deltaTime < 300) {
    if (deltaX > 0) {
      navigateToPrevious();
    } else {
      navigateToNext();
    }
  }
};
```

### Performance Optimizations

#### 1. **Event Caching**
```javascript
// Cache events to reduce API calls
const eventCache = new Map();

const getCachedEvents = (dateRange) => {
  const key = `${dateRange.start}-${dateRange.end}`;
  if (eventCache.has(key)) {
    return eventCache.get(key);
  }
  
  return fetchEventsFromAPI(dateRange).then(events => {
    eventCache.set(key, events);
    return events;
  });
};
```

#### 2. **Debounced Search**
```javascript
const debouncedSearch = useCallback(
  debounce((searchTerm) => {
    searchEvents(searchTerm);
  }, 300),
  []
);
```

## 📚 API Documentation

### Base URL
```
Development: http://localhost:5000/api
Production: https://your-domain.com/api
```

### Endpoints

#### Events

**GET /api/events**
```
Description: Get all events or events within date range
Parameters:
  - start (optional): ISO date string
  - end (optional): ISO date string
Response: Array of event objects
```

**POST /api/events**
```
Description: Create a new event
Body: {
  title: string (required),
  description: string,
  location: string,
  start: ISO date string (required),
  end: ISO date string (required),
  allDay: boolean,
  color: string,
  userEmail: string,
  remindersEnabled: boolean
}
Response: Created event object
```

**PUT /api/events/:id**
```
Description: Update an existing event
Parameters:
  - id: Event ID
Body: Event object (same as POST)
Response: Updated event object
```

**DELETE /api/events/:id**
```
Description: Delete an event
Parameters:
  - id: Event ID
Response: Success message
```

#### Reminders

**GET /api/reminders**
```
Description: Get all scheduled reminders
Response: Array of reminder objects
```

**POST /api/reminders/test/:eventId**
```
Description: Send test reminder for an event
Parameters:
  - eventId: Event ID
Body: { type: '1day' | '1hour' }
Response: Success message
```

#### Utility

**GET /api/health**
```
Description: Health check endpoint
Response: { status: 'OK', message: 'Calendar API is running' }
```

**GET /api/events/stats**
```
Description: Get event statistics
Response: {
  total: number,
  thisMonth: number,
  today: number
}
```

### Error Responses

```json
{
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": "Additional details if available"
}
```

Common HTTP Status Codes:
- `200`: Success
- `201`: Created
- `400`: Bad Request
- `404`: Not Found
- `500`: Internal Server Error

## 🧪 Testing

### Frontend Testing
```bash
cd frontend
npm run test
```

**Test Coverage:**
- Component rendering tests
- User interaction tests
- API integration tests
- Date/time logic tests

### Backend Testing
```bash
cd backend
npm run test
```

**Test Coverage:**
- API endpoint tests
- Database operation tests
- Email service tests
- Reminder scheduling tests

### Manual Testing Checklist

- [ ] Create event in all views (Month/Week/Day)
- [ ] Edit existing events
- [ ] Delete events
- [ ] Test reminder emails
- [ ] Check responsive design
- [ ] Verify data persistence
- [ ] Test error handling

## 🚀 Deployment

### Environment Setup

#### Production Environment Variables
```env
NODE_ENV=production
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/calendar
PORT=5000
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_USER=apikey
EMAIL_PASS=your-production-api-key
```

### Deployment Options

#### 1. **Heroku Deployment**

```bash
# Install Heroku CLI
npm install -g heroku

# Login and create app
heroku login
heroku create your-calendar-app

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set MONGODB_URI=your-mongodb-uri

# Deploy
git push heroku main
```

#### 2. **Docker Deployment**

**Docker Compose:**
```yaml
version: '3.8'
services:
  backend:
    build: ./backend
    ports:
      - "5000:5000"
    environment:
      - MONGODB_URI=mongodb://mongo:27017/calendar
    depends_on:
      - mongo
  
  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    depends_on:
      - backend
  
  mongo:
    image: mongo:5.0
    ports:
      - "27017:27017"
    volumes:
      - mongo-data:/data/db

volumes:
  mongo-data:
```

## 🔮 Future Enhancements

### Short-term (v1.1 - v1.3)

#### 1. **Recurring Events** (v1.1)
- **Daily, Weekly, Monthly patterns**
- **Custom recurrence rules**
- **Exception handling (skip specific dates)**
- **Edit series vs single occurrence**

#### 2. **Enhanced Reminders** (v1.1)
- **Custom reminder times** (15min, 30min, 2hrs, 1week)
- **Multiple reminders per event**
- **SMS notifications** (Twilio integration)
- **Push notifications** (Web Push API)

#### 3. **Event Categories** (v1.2)
- **Color-coded categories** (Work, Personal, Health, etc.)
- **Category-based filtering**
- **Category templates** with default settings

#### 4. **Search & Filtering** (v1.2)
- **Full-text search** across titles and descriptions
- **Advanced filters** (date range, category, location)
- **Search suggestions** and autocomplete

#### 5. **Import/Export** (v1.3)
- **iCalendar (.ics) import/export**
- **Google Calendar sync** (bi-directional)
- **Outlook Calendar integration**

### Medium-term (v2.0 - v2.5)

#### 1. **Multi-user Support** (v2.0)
- **User authentication** (JWT, OAuth)
- **Individual user calendars**
- **Shared calendars** with permissions

#### 2. **Real-time Collaboration** (v2.1)
- **WebSocket integration** for live updates
- **Multi-user event editing**
- **Conflict resolution**

#### 3. **Meeting Management** (v2.2)
- **Meeting invitations** with RSVP
- **Attendee management**
- **Video conference integration** (Zoom, Teams)

#### 4. **Mobile Applications** (v2.4)
- **React Native** iOS/Android apps
- **Offline synchronization**
- **Native push notifications**

### Long-term (v3.0+)

#### 1. **Enterprise Features**
- **LDAP/Active Directory integration**
- **Single Sign-On (SSO)**
- **Advanced security features**

#### 2. **AI-Powered Features**
- **Smart scheduling** suggestions
- **Natural language event creation**
- **Travel time calculations**

## 🤝 Contributing

### Development Workflow

1. **Fork the repository**
2. **Create feature branch**: `git checkout -b feature/amazing-feature`
3. **Make changes** and add tests
4. **Run tests**: `npm test`
5. **Commit changes**: `git commit -m 'Add amazing feature'`
6. **Push to branch**: `git push origin feature/amazing-feature`
7. **Create Pull Request**

### Code Standards

#### JavaScript/React
- Use **ES6+** features
- Follow **React Hooks** patterns
- Implement **prop-types** or TypeScript
- Use **functional components** over class components

#### CSS
- Follow **BEM methodology** for class naming
- Use **CSS custom properties** for theming
- Implement **mobile-first** responsive design

#### API Design
- Follow **RESTful** conventions
- Use **meaningful HTTP status codes**
- Implement **consistent error responses**

## 🆘 Support & Troubleshooting

### Common Issues

#### 1. **MongoDB Connection Issues**
```bash
# Check MongoDB status
mongosh --eval "db.runCommand({connectionStatus : 1})"

# Restart MongoDB service
# Windows: net restart MongoDB
# macOS: brew services restart mongodb-community
# Linux: sudo systemctl restart mongod
```

#### 2. **Email Sending Issues**
- Verify email credentials in `.env`
- Check firewall settings for SMTP ports
- Test with development email service (Ethereal)

#### 3. **Frontend Build Issues**
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear Vite cache
rm -rf node_modules/.vite
```

#### 4. **API CORS Issues**
- Verify CORS configuration in backend
- Check frontend API base URL
- Ensure proper HTTP/HTTPS protocol matching

### Getting Help

- **GitHub Issues**: Report bugs and request features
- **Documentation**: Check comprehensive docs
- **Stack Overflow**: Tag questions with `google-calendar-clone`

## 🔗 Repository Information

### GitHub Repository
- **Repository**: [https://github.com/Sahilnitjsr/google-calendar](https://github.com/Sahilnitjsr/google-calendar)
- **Owner**: Sahilnitjsr
- **Branch**: main
- **Clone URL**: `git clone https://github.com/Sahilnitjsr/google-calendar.git`

### Contributing

We welcome contributions! Please follow these steps:

1. **Fork the repository**
   ```bash
   git clone https://github.com/Sahilnitjsr/google-calendar.git
   cd google-calendar
   ```

2. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Make your changes and commit**
   ```bash
   git add .
   git commit -m "Add your descriptive commit message"
   ```

4. **Push to your fork and create a Pull Request**
   ```bash
   git push origin feature/your-feature-name
   ```

### Development Guidelines
- Follow the existing code style
- Add tests for new features
- Update documentation as needed
- Ensure all tests pass before submitting PR

## 📄 License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.

### MIT License Summary
- ✅ **Commercial use** allowed
- ✅ **Modification** allowed
- ✅ **Distribution** allowed
- ✅ **Private use** allowed
- ❌ **Liability** - No warranty provided
- ❌ **Warranty** - Use at your own risk

---

**Built with ❤️ by [Sahilnitjsr](https://github.com/Sahilnitjsr)**

🌟 **Star this repository if you found it helpful!**

*For the latest updates and announcements, follow our [GitHub repository](https://github.com/Sahilnitjsr/google-calendar)*