import { tool } from 'ai';
import { z } from 'zod';
import Exa from 'exa-js';

// Initialize Exa with API key from environment
// Requires process.env.EXA_API_KEY to be set: https://exa.ai
// Exa provides AI-powered semantic search with better relevance than traditional keyword search
const exa = process.env.EXA_API_KEY ? new Exa(process.env.EXA_API_KEY) : null;

export const exaSearchTool = tool({
  description: `Search the web using Exa's AI-powered semantic search. 
  Better than traditional search engines for finding relevant, high-quality content.
  Use this for: latest news, research, company information, technical documentation, etc.
  The query should be a natural language question or statement.`,
  inputSchema: z.object({
    query: z
      .string()
      .describe('The search query in natural language (e.g., "latest AI developments in 2025")'),
    numResults: z
      .number()
      .optional()
      .default(5)
      .describe('Number of results to return (default: 5)'),
    type: z
      .enum(['auto', 'neural', 'keyword'])
      .optional()
      .default('auto')
      .describe('Search type: auto (recommended), neural (semantic), or keyword (traditional)'),
  }),
  execute: async ({ query, numResults = 5, type = 'auto' }) => {
    if (!exa) {
      return {
        error: 'Exa API is not configured. Please set EXA_API_KEY in your environment variables.',
        results: [],
      };
    }

    try {
      // Search with Exa and get contents
      const searchResults = await exa.searchAndContents(query, {
        numResults,
        type,
        text: { maxCharacters: 1000 }, // Get text content
        highlights: { numSentences: 3, highlightsPerUrl: 2 }, // Get highlighted excerpts
      });

      // Format results for the agent
      const formattedResults = searchResults.results.map((result: any) => ({
        title: result.title,
        url: result.url,
        publishedDate: result.publishedDate || 'N/A',
        author: result.author || 'N/A',
        text: result.text || '',
        highlights: result.highlights || [],
        score: result.score || 0,
      }));

      return {
        query,
        numResults: formattedResults.length,
        results: formattedResults,
        summary: `Found ${formattedResults.length} results for: "${query}"`,
      };
    } catch (error) {
      console.error('Exa search error:', error);
      return {
        error: `Search failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        results: [],
      };
    }
  },
});
