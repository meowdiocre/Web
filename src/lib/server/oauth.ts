import { GitHub } from 'arctic';

let _client: GitHub | null = null;

function siteUrl(): string {
  return (
    process.env.PUBLIC_SITE_URL ??
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:5173')
  );
}

export function githubClient(): GitHub {
  if (_client) return _client;
  const id     = process.env.GITHUB_CLIENT_ID;
  const secret = process.env.GITHUB_CLIENT_SECRET;
  if (!id || !secret) {
    throw new Error('GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET must be set.');
  }
  _client = new GitHub(id, secret, `${siteUrl()}/admin/callback`);
  return _client;
}

export const ADMIN_LOGIN_ENV = 'ADMIN_GITHUB_LOGIN';

export function adminLogin(): string {
  const login = process.env[ADMIN_LOGIN_ENV];
  if (!login) throw new Error(`${ADMIN_LOGIN_ENV} must be set.`);
  return login.toLowerCase();
}

export interface GithubUser {
  id:         number;
  login:      string;
  name?:      string | null;
  avatar_url?: string | null;
}

export async function fetchGithubUser(accessToken: string): Promise<GithubUser> {
  const res = await fetch('https://api.github.com/user', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'User-Agent':  'meowdiocre-admin'
    }
  });
  if (!res.ok) throw new Error(`GitHub user fetch failed: ${res.status}`);
  return (await res.json()) as GithubUser;
}
