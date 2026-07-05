import { error, redirect } from '@sveltejs/kit';

import { upsertGithubUser } from '$lib/server/db/auth-queries';
import {
  createSession,
  generateSessionToken,
  SESSION_COOKIE,
  sessionCookieOptions
} from '$lib/server/auth';
import { adminLogin, fetchGithubUser, githubClient } from '$lib/server/oauth';

const STATE_COOKIE = 'gh_oauth_state';

/** @type {import('./$types').RequestHandler} */
export async function GET({ url, cookies }) {
  const code         = url.searchParams.get('code');
  const stateParam   = url.searchParams.get('state');
  const stateCookie  = cookies.get(STATE_COOKIE);
  cookies.delete(STATE_COOKIE, { path: '/' });

  if (!code || !stateParam || !stateCookie || stateParam !== stateCookie) {
    error(400, 'Invalid OAuth state.');
  }

  let tokens;
  try {
    tokens = await githubClient().validateAuthorizationCode(code);
  } catch {
    error(400, 'OAuth code rejected.');
  }

  try {
    const access  = tokens.accessToken();
    const profile = await fetchGithubUser(access);

    if (profile.login.toLowerCase() !== adminLogin()) {
      error(403, 'This GitHub account is not allowed to administer this site.');
    }

    const userId = await upsertGithubUser(profile);
    const token   = generateSessionToken();
    const session = await createSession(token, userId);
    cookies.set(SESSION_COOKIE, token, sessionCookieOptions(session.expiresAt));
  } catch (e) {
    if (e && typeof e === 'object' && 'status' in e) throw e;
    cookies.delete(SESSION_COOKIE, { path: '/' });
    error(502, 'Sign-in failed. Try again.');
  }

  redirect(302, '/admin');
}
