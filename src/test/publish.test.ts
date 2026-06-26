import { describe, expect, it, vi, beforeEach } from 'vitest';

import { signPreviewToken, verifyPreviewToken } from '$lib/server/publish';

describe('preview tokens', () => {
  it('round-trip: valid token verifies', () => {
    const t = signPreviewToken('vmprotect-3x-devirt', 60);
    expect(verifyPreviewToken(t, 'vmprotect-3x-devirt')).toBe(true);
  });

  it('expired token fails', () => {
    const t = signPreviewToken('foo', -10);
    expect(verifyPreviewToken(t, 'foo')).toBe(false);
  });

  it('wrong slug fails', () => {
    const t = signPreviewToken('foo', 60);
    expect(verifyPreviewToken(t, 'bar')).toBe(false);
  });

  it('tampered token fails', () => {
    const t  = signPreviewToken('foo', 60);
    const t2 = t.slice(0, -3) + 'AAA';
    expect(verifyPreviewToken(t2, 'foo')).toBe(false);
  });

  it('garbage token fails', () => {
    expect(verifyPreviewToken('not-a-token', 'foo')).toBe(false);
    expect(verifyPreviewToken('', 'foo')).toBe(false);
  });
});

/* ----------------------------------------------------------------- */

vi.mock('$lib/server/db/client', () => ({
  db: {
    select:  vi.fn(),
    update:  vi.fn(),
    insert:  vi.fn(),
    delete:  vi.fn(),
    execute: vi.fn()
  }
}));

describe('cron auth', () => {
  beforeEach(() => vi.clearAllMocks());

  it('rejects missing Authorization header', async () => {
    const { GET } = await import('../routes/admin/api/cron/publish/+server.js');
    await expect(GET({ request: new Request('http://localhost/x') } as any))
      .rejects.toMatchObject({ status: 401 });
  });

  it('rejects wrong CRON_SECRET', async () => {
    const { GET } = await import('../routes/admin/api/cron/publish/+server.js');
    const req = new Request('http://localhost/x', { headers: { Authorization: 'Bearer wrong' } });
    await expect(GET({ request: req } as any)).rejects.toMatchObject({ status: 401 });
  });
});
