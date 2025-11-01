import { tool } from 'ai';
import { endOfDay, formatISO, startOfDay } from 'date-fns';
import { google } from 'googleapis';
import { z } from 'zod';

import { withGoogleConnection } from '../auth0-ai';
import { getAccessTokenFromTokenVault } from '@auth0/ai-vercel';

export const getCalendarEventsTool = withGoogleConnection(
  tool({
    description: `READ/VIEW calendar events for a given date from the user's Google Calendar. Use this ONLY to check/view existing events. DO NOT use this to create events - use createCalendarEventTool instead.`,
    inputSchema: z.object({
      date: z.coerce.date().describe('The date to check for events'),
    }),
    execute: async ({ date }) => {
      // Get the access token from Auth0 AI (from context injected by withGoogleConnection)
      const accessToken = getAccessTokenFromTokenVault();
      
      if (!accessToken) {
        throw new Error('No access token available');
      }

      // Google SDK
      try {
        const calendar = google.calendar('v3');
        const auth = new google.auth.OAuth2();

        auth.setCredentials({
          access_token: accessToken,
        });

        // Get events for the entire day
        const response = await calendar.events.list({
          auth,
          calendarId: 'primary',
          timeMin: formatISO(startOfDay(date)),
          timeMax: formatISO(endOfDay(date)),
          singleEvents: true,
          orderBy: 'startTime',
          maxResults: 50,
        });

        const events = response.data.items || [];

        return {
          date: formatISO(date, { representation: 'date' }),
          eventsCount: events.length,
          events: events.map((event) => ({
            id: event.id,
            summary: event.summary || 'No title',
            description: event.description,
            startTime: event.start?.dateTime || event.start?.date,
            endTime: event.end?.dateTime || event.end?.date,
            location: event.location,
            attendees:
              event.attendees?.map((attendee) => ({
                email: attendee.email,
                name: attendee.displayName,
                responseStatus: attendee.responseStatus,
              })) || [],
            status: event.status,
            htmlLink: event.htmlLink,
          })),
        };
      } catch (error) {
        // Let withGoogleConnection handle auth errors and throw TokenVaultInterrupt automatically
        throw error;
      }
    },
  }),
);

export const createCalendarEventTool = withGoogleConnection(
  tool({
    description: `CREATE/SCHEDULE a new event in the user's Google Calendar. Use this when the user asks to create, schedule, add, or set up a meeting, appointment, reminder, or calendar event. This will actually create the event and send invitations to attendees.`,
    inputSchema: z.object({
      summary: z.string().describe('The title/summary of the event (required)'),
      description: z.string().optional().describe('Optional detailed description of the event'),
      startTime: z.string().describe('Start time in ISO 8601 format (e.g., "2025-10-26T10:00:00-07:00"). REQUIRED.'),
      endTime: z.string().describe('End time in ISO 8601 format (e.g., "2025-10-26T11:00:00-07:00"). REQUIRED.'),
      location: z.string().optional().describe('Optional location of the event'),
      attendees: z.array(z.string()).optional().describe('Optional array of attendee email addresses. Invitations will be sent.'),
    }),
    execute: async ({ summary, description, startTime, endTime, location, attendees }) => {
      // Get the access token from Auth0 AI (from context injected by withGoogleConnection)
      const accessToken = getAccessTokenFromTokenVault();
      
      if (!accessToken) {
        throw new Error('No access token available');
      }

      // Google SDK
      try {
        const calendar = google.calendar('v3');
        const auth = new google.auth.OAuth2();

        auth.setCredentials({
          access_token: accessToken,
        });

        // Create the event
        const event = {
          summary,
          description,
          location,
          start: {
            dateTime: startTime,
          },
          end: {
            dateTime: endTime,
          },
          attendees: attendees?.map((email) => ({ email })),
        };

        const response = await calendar.events.insert({
          auth,
          calendarId: 'primary',
          requestBody: event,
          sendUpdates: 'all', // Send email notifications to attendees
        });

        return {
          success: true,
          eventId: response.data.id,
          summary: response.data.summary,
          startTime: response.data.start?.dateTime,
          endTime: response.data.end?.dateTime,
          htmlLink: response.data.htmlLink,
          message: `Event "${summary}" created successfully`,
        };
      } catch (error) {
        // Let withGoogleConnection handle auth errors and throw TokenVaultInterrupt automatically
        throw error;
      }
    },
  }),
);
