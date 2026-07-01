import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { config as loadDotenv } from 'dotenv';
import postgres from 'postgres';

const thisDir = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(thisDir, '..', '..');

export const PROJECT_ROOT = projectRoot;
export const MIGRATIONS_DIR = projectPath('drizzle', 'migrations');

let envLoaded = false;

export function projectPath(...parts: string[]): string {
  return resolve(projectRoot, ...parts);
}

export function loadProjectEnv(): void {
  if (envLoaded) return;
  loadDotenv({ path: projectPath('.env') });
  envLoaded = true;
}

export function getDatabaseUrl(opts: { optional?: boolean } = {}): string | null {
  loadProjectEnv();

  const url = process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL ?? null;
  if (!url && !opts.optional) {
    throw new Error('DATABASE_URL_UNPOOLED or DATABASE_URL must be set.');
  }
  return url;
}

export function openSqlClient(url: string) {
  return postgres(url, { max: 1, prepare: false });
}

export function redactUrl(url: string): string {
  return url.replace(/:[^:@]+@/, ':***@');
}
