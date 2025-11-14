const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const cron = require('node-cron');
const nodemailer = require('nodemailer');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/google-calendar-clone';

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB successfully');
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// Reminder Schema
const reminderSchema = new mongoose.Schema({
  eventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true
  },
  type: {
    type: String,
    enum: ['1day', '1hour'],
    required: true
  },
  scheduledTime: {
    type: Date,
    required: true
  },
  sent: {
    type: Boolean,
    default: false
  },
  sentAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Event Schema
const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true,
    default: ''
  },
  location: {
    type: String,
    trim: true,
    default: ''
  },
  start: {
    type: Date,
    required: true
  },
  end: {
    type: Date,
    required: true
  },
  allDay: {
    type: Boolean,
    default: false
  },
  color: {
    type: String,
    default: '#1a73e8',
    match: /^#[0-9A-F]{6}$/i
  },
  userEmail: {
    type: String,
    required: false,
    trim: true,
    lowercase: true
  },
  remindersEnabled: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true // Automatically adds createdAt and updatedAt
});

// Event Model
const Event = mongoose.model('Event', eventSchema);
const Reminder = mongoose.model('Reminder', reminderSchema);

// Email configuration
const transporter = nodemailer.createTransport({
  // You can configure this with your email service (Gmail, SendGrid, etc.)
  // For development, you can use ethereal email or console logging
  host: process.env.EMAIL_HOST || 'smtp.ethereal.email',
  port: process.env.EMAIL_PORT || 587,
  auth: {
    user: process.env.EMAIL_USER || '',
    pass: process.env.EMAIL_PASS || ''
  }
});

// Helper function to create reminders for an event
async function createReminders(event) {
  if (!event.remindersEnabled) return;

  const eventStart = new Date(event.start);
  const oneDayBefore = new Date(eventStart.getTime() - (24 * 60 * 60 * 1000));
  const oneHourBefore = new Date(eventStart.getTime() - (60 * 60 * 1000));

  const reminders = [];

  // Only create reminder if it's in the future
  if (oneDayBefore > new Date()) {
    reminders.push({
      eventId: event._id,
      type: '1day',
      scheduledTime: oneDayBefore
    });
  }

  if (oneHourBefore > new Date()) {
    reminders.push({
      eventId: event._id,
      type: '1hour',
      scheduledTime: oneHourBefore
    });
  }

  if (reminders.length > 0) {
    await Reminder.insertMany(reminders);
  }
}

// Helper function to delete reminders for an event
async function deleteReminders(eventId) {
  await Reminder.deleteMany({ eventId, sent: false });
}

// Helper function to send reminder notification
async function sendReminderNotification(event, reminderType) {
  if (!event.userEmail) {
    console.log(`Reminder notification for event "${event.title}" (${reminderType} before) - No email configured`);
    return;
  }

  const timeText = reminderType === '1day' ? '1 day' : '1 hour';
  const eventDate = new Date(event.start).toLocaleString();

  const mailOptions = {
    from: process.env.EMAIL_FROM || 'noreply@calendar-app.com',
    to: event.userEmail,
    subject: `Reminder: ${event.title} in ${timeText}`,
    html: `
      <h2>Event Reminder</h2>
      <p>This is a reminder that your event "<strong>${event.title}</strong>" is starting in ${timeText}.</p>
      <p><strong>Date & Time:</strong> ${eventDate}</p>
      ${event.location ? `<p><strong>Location:</strong> ${event.location}</p>` : ''}
      ${event.description ? `<p><strong>Description:</strong> ${event.description}</p>` : ''}
      <p>Don't forget to prepare for your event!</p>
    `
  };

  try {
    if (process.env.NODE_ENV === 'development') {
      console.log('Development mode - Email would be sent:', mailOptions);
    } else {
      await transporter.sendMail(mailOptions);
      console.log(`Reminder email sent to ${event.userEmail} for event: ${event.title}`);
    }
  } catch (error) {
    console.error('Error sending reminder email:', error);
  }
}

// POST /api/events - Create Event
app.post('/api/events', async (req, res) => {
  try {
    const { title, description, location, start, end, allDay, color, userEmail, remindersEnabled } = req.body;
    
    if (!title || !start || !end) {
      return res.status(400).json({ error: 'Title, start, and end are required' });
    }

    const event = new Event({
      title,
      description: description || '',
      location: location || '',
      start: new Date(start),
      end: new Date(end),
      allDay: Boolean(allDay),
      color: color || '#1a73e8',
      userEmail: userEmail || '',
      remindersEnabled: remindersEnabled !== false
    });

    const savedEvent = await event.save();
    
    // Create reminders for the event
    await createReminders(savedEvent);
    
    res.status(201).json(savedEvent);
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(500).json({ error: 'Failed to create event' });
  }
});

// GET /api/events - Get Events
app.get('/api/events', async (req, res) => {
  try {
    const { start, end } = req.query;
    
    let query = {};
    
    if (start && end) {
      // Find overlapping events: event starts before query end AND event ends after query start
      query = {
        start: { $lt: new Date(end) },
        end: { $gt: new Date(start) }
      };
    }
    
    const events = await Event.find(query).sort({ start: 1 });
    res.json(events);
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ error: 'Failed to fetch events' });
  }
});

// PUT /api/events/:id - Update Event
app.put('/api/events/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, location, start, end, allDay, color, userEmail, remindersEnabled } = req.body;
    
    if (!title || !start || !end) {
      return res.status(400).json({ error: 'Title, start, and end are required' });
    }

    // Delete existing reminders for this event
    await deleteReminders(id);

    const updatedEvent = await Event.findByIdAndUpdate(
      id,
      {
        title,
        description: description || '',
        location: location || '',
        start: new Date(start),
        end: new Date(end),
        allDay: Boolean(allDay),
        color: color || '#1a73e8',
        userEmail: userEmail || '',
        remindersEnabled: remindersEnabled !== false
      },
      { new: true, runValidators: true }
    );

    if (!updatedEvent) {
      return res.status(404).json({ error: 'Event not found' });
    }

    // Create new reminders for the updated event
    await createReminders(updatedEvent);

    res.json(updatedEvent);
  } catch (error) {
    console.error('Error updating event:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ error: 'Invalid event ID' });
    }
    res.status(500).json({ error: 'Failed to update event' });
  }
});

// DELETE /api/events/:id - Delete Event
app.delete('/api/events/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const deletedEvent = await Event.findByIdAndDelete(id);
    
    if (!deletedEvent) {
      return res.status(404).json({ error: 'Event not found' });
    }
    
    // Delete associated reminders
    await deleteReminders(id);
    
    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    console.error('Error deleting event:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ error: 'Invalid event ID' });
    }
    res.status(500).json({ error: 'Failed to delete event' });
  }
});

// GET /api/events/upcoming - Get upcoming events
app.get('/api/events/upcoming', async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const now = new Date();
    
    const events = await Event.find({ start: { $gte: now } })
      .sort({ start: 1 })
      .limit(parseInt(limit));
    
    res.json(events);
  } catch (error) {
    console.error('Error fetching upcoming events:', error);
    res.status(500).json({ error: 'Failed to fetch upcoming events' });
  }
});

// GET /api/events/stats - Get event statistics
app.get('/api/events/stats', async (req, res) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfToday = new Date(startOfToday);
    endOfToday.setDate(endOfToday.getDate() + 1);
    
    const [total, thisMonth, today] = await Promise.all([
      Event.countDocuments(),
      Event.countDocuments({ start: { $gte: startOfMonth } }),
      Event.countDocuments({ 
        start: { $gte: startOfToday, $lt: endOfToday } 
      })
    ]);
    
    res.json({ total, thisMonth, today });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

// GET /api/reminders - Get all reminders for debugging
app.get('/api/reminders', async (req, res) => {
  try {
    const reminders = await Reminder.find().populate('eventId').sort({ scheduledTime: 1 });
    res.json(reminders);
  } catch (error) {
    console.error('Error fetching reminders:', error);
    res.status(500).json({ error: 'Failed to fetch reminders' });
  }
});

// POST /api/reminders/test - Test sending reminder manually (for debugging)
app.post('/api/reminders/test/:eventId', async (req, res) => {
  try {
    const { eventId } = req.params;
    const { type = '1hour' } = req.body;
    
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }
    
    await sendReminderNotification(event, type);
    res.json({ message: 'Test reminder sent successfully' });
  } catch (error) {
    console.error('Error sending test reminder:', error);
    res.status(500).json({ error: 'Failed to send test reminder' });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Calendar API is running' });
});

// Cron job to check for due reminders every minute
cron.schedule('* * * * *', async () => {
  try {
    const now = new Date();
    const dueReminders = await Reminder.find({
      scheduledTime: { $lte: now },
      sent: false
    }).populate('eventId');

    for (const reminder of dueReminders) {
      if (reminder.eventId) {
        await sendReminderNotification(reminder.eventId, reminder.type);
        
        // Mark reminder as sent
        reminder.sent = true;
        reminder.sentAt = now;
        await reminder.save();
        
        console.log(`Reminder sent for event: ${reminder.eventId.title} (${reminder.type} before)`);
      }
    }
    
    if (dueReminders.length > 0) {
      console.log(`Processed ${dueReminders.length} due reminders`);
    }
  } catch (error) {
    console.error('Error processing reminders:', error);
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log('Reminder system is active - checking every minute for due reminders');
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\nShutting down server...');
  try {
    await mongoose.connection.close();
    console.log('MongoDB connection closed.');
    process.exit(0);
  } catch (error) {
    console.error('Error closing database:', error);
    process.exit(1);
  }
});