import { redirect } from '@sveltejs/kit';
import { generateState } from 'arctic';
import { githubClient } from '$lib/server/oauth';

const STATE_COOKIE = 'gh_oauth_state';

/** @type {import('./$types').RequestHandler} */
export function GET({ cookies }) {
  const state = generateState();
  const url   = githubClient().createAuthorizationURL(state, ['read:user']);

  cookies.set(STATE_COOKIE, state, {
    httpOnly: true,
    secure:   process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path:     '/',
    maxAge:   60 * 10
  });

  redirect(302, url.toString());
}
