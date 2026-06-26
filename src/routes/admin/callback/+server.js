import { error, redirect } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';

import { db }    from '$lib/server/db/client';
import { users } from '$lib/server/db/schema';
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

  const access  = tokens.accessToken();
  const profile = await fetchGithubUser(access);

  if (profile.login.toLowerCase() !== adminLogin()) {
    error(403, 'This GitHub account is not allowed to administer this site.');
  }

  // Upsert the admin user row.
  const existing = await db.select().from(users).where(eq(users.githubId, profile.id)).limit(1);
  let userId;
  if (existing[0]) {
    await db
      .update(users)
      .set({
        githubLogin: profile.login,
        name:        profile.name ?? null,
        avatarUrl:   profile.avatar_url ?? null
      })
      .where(eq(users.id, existing[0].id));
    userId = existing[0].id;
  } else {
    const [row] = await db
      .insert(users)
      .values({
        githubId:    profile.id,
        githubLogin: profile.login,
        name:        profile.name ?? null,
        avatarUrl:   profile.avatar_url ?? null
      })
      .returning({ id: users.id });
    userId = row.id;
  }

  const token   = generateSessionToken();
  const session = await createSession(token, userId);
  cookies.set(SESSION_COOKIE, token, sessionCookieOptions(session.expiresAt));

  redirect(302, '/admin');
}
