/**
 * Environment variable validation
 * Throws descriptive errors if required env vars are missing
 */

export interface EnvValidationResult {
  isValid: boolean;
  missing: string[];
  message?: string;
}

const REQUIRED_ENV_VARS = {
  DATABASE_URL: 'PostgreSQL connection string',
  MISTRAL_API_KEY: 'Mistral AI API key from console.mistral.ai',
  AUTH0_DOMAIN: 'Auth0 domain (e.g., your-domain.us.auth0.com)',
  AUTH0_CLIENT_ID: 'Auth0 application client ID',
  AUTH0_CLIENT_SECRET: 'Auth0 application client secret',
  AUTH0_SECRET: 'Auth0 session secret (generate with: openssl rand -hex 32)',
  APP_BASE_URL: 'Application base URL (e.g., http://localhost:3000)',
} as const;

const OPTIONAL_ENV_VARS = {
  EXA_API_KEY: 'Exa AI API key for enhanced web search',
  FGA_STORE_ID: 'Auth0 FGA store ID',
  FGA_CLIENT_ID: 'Auth0 FGA client ID',
  FGA_CLIENT_SECRET: 'Auth0 FGA client secret',
  FGA_MODEL_ID: 'Auth0 FGA model ID (generated after fga:init)',
  MISTRAL_CHAT_MODEL: 'Mistral chat model override',
  MISTRAL_EMBEDDING_MODEL: 'Mistral embedding model override',
} as const;

/**
 * Validates that all required environment variables are set
 * @param throwOnError If true, throws an error with detailed message. If false, returns validation result.
 */
export function validateEnv(throwOnError = true): EnvValidationResult {
  const missing: string[] = [];
  
  for (const [key, description] of Object.entries(REQUIRED_ENV_VARS)) {
    if (!process.env[key]) {
      missing.push(`${key} - ${description}`);
    }
  }

  if (missing.length > 0) {
    const message = `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚠️  MISSING REQUIRED ENVIRONMENT VARIABLES ⚠️
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

The following environment variables are required but not set:

${missing.map((m, i) => `  ${i + 1}. ${m}`).join('\n')}

📋 Setup Instructions:
  1. Copy .env.example to .env.local
  2. Fill in all required values
  3. Restart the development server

📚 Documentation: See README.md for detailed setup guide

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    `.trim();

    if (throwOnError) {
      throw new Error(message);
    }
    
    return {
      isValid: false,
      missing: missing.map(m => m.split(' - ')[0]),
      message,
    };
  }

  return { isValid: true, missing: [] };
}

/**
 * Get a user-friendly error message for missing env vars
 */
export function getUserFriendlyEnvError(): string {
  try {
    validateEnv(true);
    return '';
  } catch (error) {
    return 'Configuration Error: Missing required environment variables. Please check server logs and ensure all required environment variables are set in your .env.local file.';
  }
}

/**
 * Validate specific env vars with custom error message
 */
export function requireEnv(varName: string, description?: string): string {
  const value = process.env[varName];
  if (!value) {
    throw new Error(
      `Missing required environment variable: ${varName}${description ? ` - ${description}` : ''}\n\n` +
      `Please set this in your .env.local file and restart the server.\n` +
      `See .env.example for reference.`
    );
  }
  return value;
}
