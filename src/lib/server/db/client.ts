import { drizzle as drizzleNeon } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import * as schema from './schema';

function createDb(url: string) {
  const client = neon(url);
  return drizzleNeon(client, { schema, casing: 'snake_case' });
}

type DbClient = ReturnType<typeof createDb>;

let _db: DbClient | null = null;

export function getDb(): DbClient {
  if (_db) return _db;
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      'DATABASE_URL is not set. Copy .env.example to .env and configure your Neon connection string.'
    );
  }
  _db = createDb(url);
  return _db;
}

export const db = new Proxy({} as DbClient, {
  get(_target, prop) {
    return (getDb() as any)[prop];
  }
});

export { schema };
