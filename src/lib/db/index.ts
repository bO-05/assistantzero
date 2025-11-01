import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { requireEnv } from '@/lib/env-validation';

// Validate DATABASE_URL with clear error message
const DATABASE_URL = requireEnv(
  'DATABASE_URL',
  'PostgreSQL connection string. See README.md for setup instructions.'
);

const dbClientPropertyName = `__prevent-name-collision__db`;
type GlobalThisWithDbClient = typeof globalThis & {
  [dbClientPropertyName]: any;
};

const getDbClient = () => {
  try {
    if (process.env.NODE_ENV === 'production') {
      const client = postgres(DATABASE_URL, {
        // Add connection timeout and retry logic
        connect_timeout: 10,
        idle_timeout: 20,
        max_lifetime: 60 * 30,
      });
      return drizzle(client);
    } else {
      const newGlobalThis = globalThis as GlobalThisWithDbClient;
      if (!newGlobalThis[dbClientPropertyName]) {
        const client = postgres(DATABASE_URL, {
          connect_timeout: 10,
          idle_timeout: 20,
          max_lifetime: 60 * 30,
        });
        newGlobalThis[dbClientPropertyName] = drizzle(client);
      }
      return newGlobalThis[dbClientPropertyName];
    }
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    throw new Error(
      `Failed to connect to database. Please check your DATABASE_URL is correct and the database is accessible.\n` +
      `Error: ${(error as Error).message}`
    );
  }
};

export const db = getDbClient();
