import { describe, expect, it, vi, beforeEach } from 'vitest';

import { generateSessionToken, hashToken, SESSION_COOKIE } from '$lib/server/auth';

describe('session tokens', () => {
  it('emits a 32-char base32 token', () => {
    const t = generateSessionToken();
    expect(t).toMatch(/^[a-z2-7]{32}$/);
  });

  it('hashes deterministically to a 64-char hex', () => {
    const t  = 'abcdefghij2345678901234567890123';
    const h1 = hashToken(t);
    const h2 = hashToken(t);
    expect(h1).toBe(h2);
    expect(h1).toMatch(/^[0-9a-f]{64}$/);
    expect(hashToken(t + '!')).not.toBe(h1);
  });
});

vi.mock('$lib/server/auth', async () => {
  const real = await vi.importActual<typeof import('$lib/server/auth')>('$lib/server/auth');
  return {
    ...real,
    validateSessionToken: vi.fn().mockResolvedValue({ session: null, user: null })
  };
});

const { handle } = await import('../hooks.server.js');
const auth       = await import('$lib/server/auth');

interface FakeCookies {
  store: Map<string, string>;
  get(name: string): string | undefined;
  set(name: string, value: string, _opts?: any): void;
  delete(name: string, _opts?: any): void;
}

function fakeCookies(initial: Record<string, string> = {}): FakeCookies {
  const store = new Map(Object.entries(initial));
  return {
    store,
    get(name) { return store.get(name); },
    set(name, value) { store.set(name, value); },
    delete(name) { store.delete(name); }
  };
}

function fakeEvent(path: string, cookies: FakeCookies) {
  return {
    url: new URL(`http://localhost${path}`),
    cookies,
    locals: {},
    request: new Request(`http://localhost${path}`)
  } as any;
}

async function callHandle(path: string, cookies: FakeCookies) {
  let resolved = false;
  let response: Response | null = null;
  try {
    response = await handle({
      event: fakeEvent(path, cookies),
      resolve: async () => {
        resolved = true;
        return new Response('ok', { status: 200 });
      }
    } as any);
  } catch (e: any) {
    if (e?.status >= 300 && e?.status < 400) {
      return { status: e.status, location: e.location ?? null, resolved };
    }
    if (e?.status === 401 || e?.status === 403) {
      return { status: e.status, resolved };
    }
    throw e;
  }
  return { status: 200, resolved, headers: response?.headers };
}

describe('admin gate', () => {
  beforeEach(() => vi.clearAllMocks());

  it('redirects unauthenticated GET /admin to /admin/login', async () => {
    const cookies = fakeCookies();
    const r = await callHandle('/admin', cookies);
    expect(r.status).toBe(302);
    expect(r.location).toBe('/admin/login');
  });

  it('does NOT gate /admin/login or /admin/callback', async () => {
    const cookies = fakeCookies();
    const r1 = await callHandle('/admin/login', cookies);
    expect(r1.status).toBe(200);
    const r2 = await callHandle('/admin/callback', cookies);
    expect(r2.status).toBe(200);
  });

  it('lets the cron endpoint perform its own bearer-token authentication', async () => {
    const result = await callHandle('/admin/api/cron/publish', fakeCookies());
    expect(result.status).toBe(200);
    expect(result.resolved).toBe(true);
  });

  it('lets admin API handlers return API-shaped authentication errors', async () => {
    const result = await callHandle('/admin/api/media', fakeCookies());
    expect(result.status).toBe(200);
    expect(result.resolved).toBe(true);
  });

  it('allows /admin when the cookie validates and yields a user', async () => {
    (auth.validateSessionToken as any).mockResolvedValueOnce({
      session: { id: 'abc', userId: 'u1', expiresAt: new Date(Date.now() + 1_000_000), createdAt: new Date() },
      user:    { id: 'u1', githubLogin: 'meowdiocre', githubId: 1, name: null, avatarUrl: null, createdAt: new Date() }
    });
    const cookies = fakeCookies({ [SESSION_COOKIE]: 'sometoken' });
    const r = await callHandle('/admin', cookies);
    expect(r.status).toBe(200);
    expect(r.resolved).toBe(true);
  });

  it('redirects to /admin/login when cookie is present but invalid', async () => {
    (auth.validateSessionToken as any).mockResolvedValueOnce({ session: null, user: null });
    const cookies = fakeCookies({ [SESSION_COOKIE]: 'bogus' });
    const r = await callHandle('/admin', cookies);
    expect(r.status).toBe(302);
    expect(r.location).toBe('/admin/login');
  });

  it('public routes are unaffected', async () => {
    const cookies = fakeCookies();
    expect((await callHandle('/',     cookies)).status).toBe(200);
    expect((await callHandle('/blog', cookies)).status).toBe(200);
  });

  it('sets baseline browser protections and prevents admin caching', async () => {
    (auth.validateSessionToken as any).mockResolvedValueOnce({
      session: { id: 'abc', userId: 'u1', expiresAt: new Date(Date.now() + 1_000_000), createdAt: new Date() },
      user: { id: 'u1', githubLogin: 'meowdiocre', githubId: 1, name: null, avatarUrl: null, createdAt: new Date() }
    });
    const result = await callHandle('/admin', fakeCookies({ [SESSION_COOKIE]: 'sometoken' }));

    expect(result.headers?.get('cache-control')).toBe('private, no-store');
    expect(result.headers?.get('x-content-type-options')).toBe('nosniff');
    expect(result.headers?.get('referrer-policy')).toBe('strict-origin-when-cross-origin');
    expect(result.headers?.get('content-security-policy')).toContain("frame-ancestors 'none'");
  });

  it('does not expose logout as a GET endpoint', async () => {
    const logout = await import('../routes/admin/logout/+server.js');
    expect('GET' in logout).toBe(false);
  });
});
