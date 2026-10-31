import { drizzle, type PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { requireEnv } from '@/lib/env-validation';

// Validate DATABASE_URL with clear error message
const DATABASE_URL = requireEnv(
  'DATABASE_URL',
  'PostgreSQL connection string. See README.md for setup instructions.'
);

const dbClientPropertyName = `__prevent-name-collision__db`;
type GlobalThisWithDbClient = typeof globalThis & {
  [dbClientPropertyName]?: PostgresJsDatabase;
};

const getDbClient = (): PostgresJsDatabase => {
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
      return newGlobalThis[dbClientPropertyName]!;
    }
  } catch {
    throw new Error('Database client initialization failed. Check the configured connection.');
  }
};

export const db = getDbClient();
