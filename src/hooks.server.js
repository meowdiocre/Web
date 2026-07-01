/**
 * Server hook chain:
 *
 *   1. data-page transform — fills %body-page% so SSR'd <body> gets the
 *                            right data-page attribute.
 *   2. auth                — populate event.locals.{user,session} from
 *                            the auth_session cookie.
 *   3. admin gate          — reject /admin/* without a valid session
 *                            (except /admin/login + /admin/callback).
 */

// Load .env into process.env so server code reading process.env.DATABASE_URL
// works in dev. SvelteKit's `$env/*` helpers don't populate process.env.
import 'dotenv/config';

import { redirect } from '@sveltejs/kit';
import {
  SESSION_COOKIE,
  expiredCookieOptions,
  sessionCookieOptions,
  validateSessionToken
} from '$lib/server/auth';

/** @param {string} pathname */
function pageKey(pathname) {
  if (pathname.startsWith('/blog'))    return 'blog';
  if (pathname.startsWith('/about'))   return 'about';
  if (pathname.startsWith('/article')) return 'article';
  if (pathname.startsWith('/admin'))   return 'admin';
  return 'home';
}

/** /admin routes exempt from the auth gate — they ARE the login flow. */
const ADMIN_PUBLIC = new Set([
  '/admin/login',
  '/admin/callback'
]);

/** @type {import('@sveltejs/kit').Handle} */
export async function handle({ event, resolve }) {
  const token = event.cookies.get(SESSION_COOKIE);
  if (token) {
    try {
      const { session, user } = await validateSessionToken(token);
      event.locals.user    = user;
      event.locals.session = session;
      if (session) {
        // Refresh cookie expiry whenever the session was extended.
        event.cookies.set(SESSION_COOKIE, token, sessionCookieOptions(session.expiresAt));
      } else {
        event.cookies.set(SESSION_COOKIE, '', expiredCookieOptions());
      }
    } catch {
      // DB unreachable: deny rather than crash. Public pages still work.
      event.locals.user    = null;
      event.locals.session = null;
    }
  } else {
    event.locals.user    = null;
    event.locals.session = null;
  }

  const path = event.url.pathname;
  if (path.startsWith('/admin') && !ADMIN_PUBLIC.has(path) && !event.locals.user) {
    throw redirect(302, '/admin/login');
  }

  const key = pageKey(path);
  return resolve(event, {
    transformPageChunk: ({ html }) => html.replace('%body-page%', key)
  });
}
