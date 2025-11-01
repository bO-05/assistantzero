import { tool } from 'ai';
import { formatISO, addDays, addHours } from 'date-fns';
import { z } from 'zod';

/**
 * DEMO MODE: Mock Google Calendar for hackathon demo
 * No OAuth required - returns fake but realistic data
 */
export const getCalendarEventsToolDemo = tool({
  description: 'Check calendar events for a date (DEMO MODE - shows example data)',
  inputSchema: z.object({
    date: z.coerce.date().describe('The date to check for events'),
  }),
  execute: async ({ date }) => {
    await new Promise(resolve => setTimeout(resolve, 700));
    
    const dateStr = formatISO(date, { representation: 'date' });
    
    return {
      date: dateStr,
      eventsCount: 3,
      events: [
        {
          id: 'demo-event-1',
          summary: 'Team Standup',
          description: 'Daily sync with the team',
          startTime: `${dateStr}T09:00:00-08:00`,
          endTime: `${dateStr}T09:30:00-08:00`,
          location: 'Zoom',
          attendees: [
            { email: 'john@example.com', name: 'John Doe', responseStatus: 'accepted' },
            { email: 'sarah@example.com', name: 'Sarah Smith', responseStatus: 'accepted' },
          ],
          status: 'confirmed',
          htmlLink: 'https://calendar.google.com/demo',
        },
        {
          id: 'demo-event-2',
          summary: 'Hackathon Presentation',
          description: 'Present Assistant0 demo to judges',
          startTime: `${dateStr}T14:00:00-08:00`,
          endTime: `${dateStr}T15:00:00-08:00`,
          location: 'Conference Room A',
          attendees: [
            { email: 'judge1@hackathon.com', name: 'Judge One', responseStatus: 'needsAction' },
            { email: 'judge2@hackathon.com', name: 'Judge Two', responseStatus: 'needsAction' },
          ],
          status: 'confirmed',
          htmlLink: 'https://calendar.google.com/demo',
        },
        {
          id: 'demo-event-3',
          summary: 'Code Review Session',
          description: 'Review Auth0 integration implementation',
          startTime: `${dateStr}T16:30:00-08:00`,
          endTime: `${dateStr}T17:30:00-08:00`,
          location: 'Virtual',
          attendees: [],
          status: 'confirmed',
          htmlLink: 'https://calendar.google.com/demo',
        },
      ],
      _demoNote: '🔐 This is DEMO MODE showing example events. Real calendar integration requires Google OAuth consent screen approval.',
    };
  },
});

export const createCalendarEventToolDemo = tool({
  description: 'Create a calendar event (DEMO MODE - simulates creation)',
  inputSchema: z.object({
    summary: z.string().describe('Event title'),
    description: z.string().optional(),
    startTime: z.string(),
    endTime: z.string(),
    location: z.string().optional(),
    attendees: z.array(z.string()).optional(),
  }),
  execute: async ({ summary, description, startTime, endTime, location, attendees }) => {
    await new Promise(resolve => setTimeout(resolve, 800));
    
    return {
      success: true,
      eventId: 'demo-created-event-' + Date.now(),
      summary,
      startTime,
      endTime,
      location,
      attendees: attendees?.map(email => ({ email, status: 'invited' })),
      htmlLink: 'https://calendar.google.com/demo',
      message: `✅ Event "${summary}" created successfully (DEMO MODE)`,
      _demoNote: '🔐 In production with Google OAuth, this event would be created in your actual Google Calendar. For this hackathon demo, we\'re simulating the functionality.',
    };
  },
});
