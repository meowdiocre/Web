import 'dotenv/config';

import { redirect } from '@sveltejs/kit';
import {
  SESSION_COOKIE,
  expiredCookieOptions,
  sessionCookieOptions,
  validateSessionToken
} from '$lib/server/auth';
import { pageKey } from '$lib/util/page';

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
        event.cookies.set(SESSION_COOKIE, token, sessionCookieOptions(session.expiresAt));
      } else {
        event.cookies.set(SESSION_COOKIE, '', expiredCookieOptions());
      }
    } catch {
      event.locals.user    = null;
      event.locals.session = null;
    }
  } else {
    event.locals.user    = null;
    event.locals.session = null;
  }

  const path = event.url.pathname;
  const isAdminApi = path.startsWith('/admin/api/');
  if (path.startsWith('/admin') && !isAdminApi && !ADMIN_PUBLIC.has(path) && !event.locals.user) {
    throw redirect(302, '/admin/login');
  }

  const key = pageKey(path);
  const response = await resolve(event, {
    transformPageChunk: ({ html }) => html.replace('%body-page%', key)
  });
  response.headers.set('content-security-policy', "frame-ancestors 'none'; base-uri 'self'; object-src 'none'");
  response.headers.set('referrer-policy', 'strict-origin-when-cross-origin');
  response.headers.set('x-content-type-options', 'nosniff');
  response.headers.set('x-frame-options', 'DENY');
  if (path.startsWith('/admin')) response.headers.set('cache-control', 'private, no-store');
  return response;
}
