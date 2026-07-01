/**
 * Apply pending migrations from ./drizzle/migrations.
 *
 *   npm run db:migrate
 */
import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import { getDatabaseUrl, MIGRATIONS_DIR, openSqlClient } from '../scripts/lib/runtime';

async function main() {
  const url = getDatabaseUrl();
  if (!url) {
    throw new Error('DATABASE_URL_UNPOOLED or DATABASE_URL must be set.');
  }
  const sqlClient = openSqlClient(url);
  const db = drizzle(sqlClient);
  // eslint-disable-next-line no-console
  console.log('▷ applying migrations');
  await migrate(db, { migrationsFolder: MIGRATIONS_DIR });
  // eslint-disable-next-line no-console
  console.log('✓ migrations applied');
  await sqlClient.end({ timeout: 5 });
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exit(1);
});
