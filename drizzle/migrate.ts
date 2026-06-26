/**
 * Apply pending migrations from ./drizzle/migrations.
 *
 *   npm run db:migrate
 */
import 'dotenv/config';
import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';

async function main() {
  const url = process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL;
  if (!url) {
    throw new Error('DATABASE_URL_UNPOOLED or DATABASE_URL must be set.');
  }
  const sql = postgres(url, { max: 1, prepare: false });
  const db = drizzle(sql);
  // eslint-disable-next-line no-console
  console.log('▷ applying migrations…');
  await migrate(db, { migrationsFolder: './drizzle/migrations' });
  // eslint-disable-next-line no-console
  console.log('✓ migrations applied');
  await sql.end({ timeout: 5 });
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exit(1);
});
