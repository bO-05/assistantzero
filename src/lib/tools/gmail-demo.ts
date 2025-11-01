import { tool } from 'ai';
import { z } from 'zod';

/**
 * DEMO MODE: Mock Gmail search for hackathon demo
 * No OAuth required - returns fake but realistic data
 */
export const gmailSearchToolDemo = tool({
  description: 'Search Gmail messages (DEMO MODE - shows example data)',
  inputSchema: z.object({
    query: z.string(),
    maxResults: z.number().optional(),
    resource: z.enum(['messages', 'threads']).optional(),
  }),
  execute: async ({ query, maxResults = 5 }) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    return `Found ${maxResults} messages matching "${query}":

1. From: john.doe@example.com
   Subject: Re: ${query} - Project Update
   Date: Nov 1, 2025
   Preview: "Thanks for reaching out about ${query}. I've reviewed the documents and have some feedback..."

2. From: sarah.smith@company.com
   Subject: ${query} Meeting Notes
   Date: Oct 31, 2025
   Preview: "Following up on our discussion about ${query}. Here are the key points we covered..."

3. From: notifications@github.com
   Subject: [Repository] ${query} - New Pull Request
   Date: Oct 30, 2025
   Preview: "A new pull request related to ${query} has been opened. Review requested..."

4. From: team@slack.com
   Subject: You were mentioned in ${query} channel
   Date: Oct 29, 2025
   Preview: "@you: Quick question about ${query} - can you take a look when you get a chance?"

5. From: support@service.com
   Subject: Your ${query} request has been processed
   Date: Oct 28, 2025
   Preview: "We've completed your request regarding ${query}. Please review the attached documents..."

🔐 Note: This is DEMO MODE showing example data. Real Gmail integration requires Google OAuth consent screen approval.`;
  },
});

export const gmailDraftToolDemo = tool({
  description: 'Create a draft email in Gmail (DEMO MODE - simulates creation)',
  inputSchema: z.object({
    message: z.string(),
    to: z.array(z.string()),
    subject: z.string(),
    cc: z.array(z.string()).optional(),
    bcc: z.array(z.string()).optional(),
  }),
  execute: async ({ to, subject, message }) => {
    await new Promise(resolve => setTimeout(resolve, 600));
    
    return `✅ Draft email created successfully (DEMO MODE)

To: ${to.join(', ')}
Subject: ${subject}

Draft preview:
${message.substring(0, 200)}${message.length > 200 ? '...' : ''}

🔐 In production with Google OAuth, this draft would be created in your actual Gmail account.
For this hackathon demo, we're simulating the functionality.`;
  },
});
