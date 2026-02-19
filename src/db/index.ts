import 'dotenv/config';
import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not defined');
}

import * as schema from './schema';

const sql = neon(process.env.DATABASE_URL);
export const db = drizzle(sql, { schema });

// Export a dummy pool placeholder for compatibility in index.ts finally block
export const pool = undefined as unknown as { end: () => Promise<void> } | undefined;
