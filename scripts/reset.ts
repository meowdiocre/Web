/**
 * scripts/reset.ts — DROP every table from drizzle/migrations and re-run
 * them. DEV ONLY. Refuses to run when NODE_ENV === 'production' unless
 * --force is passed (and even then requires explicit confirmation).
 *
 *   npm run db:reset
 *   npm run db:reset -- --force
 */
import 'dotenv/config';
import { stdin as input, stdout as output } from 'node:process';
import { createInterface } from 'node:readline/promises';
import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import { sql } from 'drizzle-orm';

async function main() {
  const args  = new Set(process.argv.slice(2));
  const force = args.has('--force');

  if (process.env.NODE_ENV === 'production' && !force) {
    throw new Error('Refusing to db:reset in production. Pass --force if you really mean it.');
  }

  const url = process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL;
  if (!url) throw new Error('DATABASE_URL_UNPOOLED or DATABASE_URL must be set.');

  const rl = createInterface({ input, output });
  const a  = await rl.question(`This will DROP ALL TABLES on ${redact(url)}. Type "yes" to proceed: `);
  rl.close();
  if (a.trim().toLowerCase() !== 'yes') {
    // eslint-disable-next-line no-console
    console.log('aborted.');
    return;
  }

  const sqlClient = postgres(url, { max: 1, prepare: false });
  const db = drizzle(sqlClient);

  try {
    // eslint-disable-next-line no-console
    console.log('▷ dropping public schema');
    await db.execute(sql`DROP SCHEMA IF EXISTS public CASCADE`);
    await db.execute(sql`CREATE SCHEMA public`);
    // eslint-disable-next-line no-console
    console.log('▷ applying migrations');
    await migrate(db, { migrationsFolder: './drizzle/migrations' });
    // eslint-disable-next-line no-console
    console.log('✓ reset complete');
  } finally {
    await sqlClient.end({ timeout: 5 });
  }
}

function redact(url: string): string {
  return url.replace(/:[^:@]+@/, ':***@');
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exit(1);
});
