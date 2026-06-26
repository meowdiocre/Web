/**
 * Server hook chain:
 *
 *   1. data-page transform   — fill in %body-page% so the SSR'd <body>
 *                              gets the right data-page attribute.
 *   2. auth                  — populate event.locals.{user,session} from
 *                              the auth_session cookie.
 *   3. admin gate            — reject /admin/* requests without a valid
 *                              session. /admin/login + /admin/callback
 *                              are exempt (they ARE the login flow).
 */

// Load .env into process.env at server boot so server code that reads
// `process.env.DATABASE_URL` etc. works in dev. SvelteKit's own
// `$env/*` helpers don't populate process.env; the scripts under
// scripts/ + drizzle/ already do this same import themselves.
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

/** Routes under /admin that must work without a session. */
const ADMIN_PUBLIC = new Set([
  '/admin/login',
  '/admin/callback'
]);

/** @type {import('@sveltejs/kit').Handle} */
export async function handle({ event, resolve }) {
  // ----- auth ---------------------------------------------------------
  const token = event.cookies.get(SESSION_COOKIE);
  if (token) {
    try {
      const { session, user } = await validateSessionToken(token);
      event.locals.user    = user;
      event.locals.session = session;
      if (session) {
        // refresh cookie expiry whenever we extended the session
        event.cookies.set(SESSION_COOKIE, token, sessionCookieOptions(session.expiresAt));
      } else {
        event.cookies.set(SESSION_COOKIE, '', expiredCookieOptions());
      }
    } catch (err) {
      // DB unreachable: deny rather than crash. Public pages still work.
      event.locals.user    = null;
      event.locals.session = null;
    }
  } else {
    event.locals.user    = null;
    event.locals.session = null;
  }

  // ----- admin gate ---------------------------------------------------
  const path = event.url.pathname;
  if (path.startsWith('/admin')) {
    const isPublic = ADMIN_PUBLIC.has(path);
    if (!isPublic && !event.locals.user) {
      throw redirect(302, '/admin/login');
    }
  }

  const key = pageKey(path);
  return resolve(event, {
    transformPageChunk: ({ html }) => html.replace('%body-page%', key)
  });
}
