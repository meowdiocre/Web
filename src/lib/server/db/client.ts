/**
 * Drizzle client. Picks a driver based on how it was imported:
 *
 *  - `db`         : runtime client. Uses `@neondatabase/serverless`
 *                   over HTTP, which is the right shape for Vercel
 *                   serverless functions (no socket pooling required).
 *  - `migrationDb`: TCP client via `postgres` (DATABASE_URL_UNPOOLED),
 *                   used by drizzle-kit and the seed script.
 *
 * If DATABASE_URL is missing we throw on first use, not at import time,
 * so unrelated dev tasks (e.g. running the public site without a DB)
 * can still boot.
 */

import { drizzle as drizzleNeon } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import * as schema from './schema';

let _db: ReturnType<typeof drizzleNeon> | null = null;

export function getDb() {
  if (_db) return _db;
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      'DATABASE_URL is not set. Copy .env.example to .env and configure your Neon connection string.'
    );
  }
  const client = neon(url);
  _db = drizzleNeon(client, { schema, casing: 'snake_case' });
  return _db;
}

/**
 * Proxy export so callers can `import { db } from '$db/client'` and get
 * lazy initialisation without a function call.
 */
export const db = new Proxy({} as ReturnType<typeof drizzleNeon>, {
  get(_target, prop) {
    return (getDb() as any)[prop];
  }
});

export { schema };
