/**
 * Cookie-backed session layer. The cookie carries a 32-byte base32
 * token; the database stores its SHA-256 hash as `sessions.id` so a
 * DB leak cannot be replayed as a valid cookie.
 *
 * Sessions live for 30 days with sliding renewal: every access that
 * finds less than 15 days remaining extends `expiresAt` back to the
 * full TTL.
 */

import { eq } from 'drizzle-orm';
import { sha256 } from '@oslojs/crypto/sha2';
import { encodeBase32LowerCaseNoPadding, encodeHexLowerCase } from '@oslojs/encoding';

import { db } from './db/client';
import { sessions, users } from './db/schema';
import type { Session, User } from './db/schema';

const DAY  = 24 * 60 * 60 * 1000;
const TTL  = 30 * DAY;
const HALF = 15 * DAY;

export const SESSION_COOKIE = 'auth_session';

/** Generate a fresh base32 token to hand to the browser. */
export function generateSessionToken(): string {
  const bytes = new Uint8Array(20);
  crypto.getRandomValues(bytes);
  return encodeBase32LowerCaseNoPadding(bytes);
}

/** Hash a cookie value into its DB key. Exported for unit testing. */
export function hashToken(token: string): string {
  return encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
}

export interface SessionValidationResult {
  session: Session | null;
  user:    User | null;
}

export async function createSession(token: string, userId: string): Promise<Session> {
  const id = hashToken(token);
  const expiresAt = new Date(Date.now() + TTL);
  const [row] = await db
    .insert(sessions)
    .values({ id, userId, expiresAt })
    .returning();
  return row;
}

export async function validateSessionToken(token: string): Promise<SessionValidationResult> {
  const id = hashToken(token);
  const rows = await db
    .select({ session: sessions, user: users })
    .from(sessions)
    .innerJoin(users, eq(sessions.userId, users.id))
    .where(eq(sessions.id, id))
    .limit(1);

  if (rows.length === 0) return { session: null, user: null };
  const { session, user } = rows[0];

  if (session.expiresAt.getTime() < Date.now()) {
    await db.delete(sessions).where(eq(sessions.id, id));
    return { session: null, user: null };
  }

  if (session.expiresAt.getTime() - Date.now() < HALF) {
    const newExpires = new Date(Date.now() + TTL);
    await db.update(sessions).set({ expiresAt: newExpires }).where(eq(sessions.id, id));
    session.expiresAt = newExpires;
  }

  return { session, user };
}

export async function invalidateSession(sessionId: string): Promise<void> {
  await db.delete(sessions).where(eq(sessions.id, sessionId));
}

export async function invalidateAllSessionsForUser(userId: string): Promise<void> {
  await db.delete(sessions).where(eq(sessions.userId, userId));
}

/** Cookie options compatible with the SvelteKit cookies API. */
export function sessionCookieOptions(expiresAt: Date) {
  return {
    httpOnly: true,
    secure:   process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path:     '/',
    expires:  expiresAt
  };
}

export function expiredCookieOptions() {
  return {
    httpOnly: true,
    secure:   process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path:     '/',
    expires:  new Date(0)
  };
}
