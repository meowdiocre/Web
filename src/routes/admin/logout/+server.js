import { redirect } from '@sveltejs/kit';
import {
  expiredCookieOptions,
  invalidateSession,
  SESSION_COOKIE
} from '$lib/server/auth';

/** @type {import('./$types').RequestHandler} */
export async function POST({ cookies, locals }) {
  if (locals.session) await invalidateSession(locals.session.id);
  cookies.set(SESSION_COOKIE, '', expiredCookieOptions());
  redirect(302, '/');
}

/** GET also works so a plain anchor can log out. */
export const GET = POST;
