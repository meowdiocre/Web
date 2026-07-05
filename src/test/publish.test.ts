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

  it('survives 500 round-trips with dot bytes inside signatures', () => {
    for (let i = 0; i < 500; i++) {
      const slug = `post-${i}-${Math.random().toString(36).slice(2, 8)}`;
      const t    = signPreviewToken(slug, 600);
      expect(verifyPreviewToken(t, slug)).toBe(true);
    }
  });
});

vi.mock('$lib/server/db/client', () => ({
  db: {
    select:  vi.fn(),
    update:  vi.fn(),
    insert:  vi.fn(),
    delete:  vi.fn(),
    execute: vi.fn()
  }
}));

vi.mock('$lib/server/db/queries', () => ({
  loadDuePosts: vi.fn()
}));
vi.mock('$lib/server/db/admin-queries', () => ({
  publishPost: vi.fn()
}));
vi.mock('$lib/server/publish', async () => {
  const real = await vi.importActual<typeof import('$lib/server/publish')>('$lib/server/publish');
  return {
    ...real,
    revalidatePaths: vi.fn().mockResolvedValue(undefined)
  };
});

const queries = await import('$lib/server/db/queries');
const admin   = await import('$lib/server/db/admin-queries');
const publish = await import('$lib/server/publish');

function authedRequest() {
  return { request: new Request('http://localhost/x', { headers: { Authorization: 'Bearer test-cron-secret' } }) } as any;
}

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

describe('cron publish path', () => {
  beforeEach(() => vi.clearAllMocks());

  it('flips each due post and revalidates their routes', async () => {
    const due = [
      { id: 'p1', slug: 'a-slug' },
      { id: 'p2', slug: 'b-slug' }
    ];
    (queries.loadDuePosts as any).mockResolvedValue(due);
    (admin.publishPost as any).mockImplementation(async (id: string) => ({ slug: due.find((d) => d.id === id)!.slug }));

    const { GET } = await import('../routes/admin/api/cron/publish/+server.js');
    const res = await GET(authedRequest());

    expect(admin.publishPost).toHaveBeenCalledTimes(2);
    expect((admin.publishPost as any).mock.calls.map((c: any[]) => c[0])).toEqual(['p1', 'p2']);

    expect(publish.revalidatePaths).toHaveBeenCalledTimes(1);
    const paths = (publish.revalidatePaths as any).mock.calls[0][0] as string[];
    expect(paths).toContain('/blog');
    expect(paths).toContain('/feed.xml');
    expect(paths).toContain('/article/a-slug');
    expect(paths).toContain('/article/b-slug');

    const body = await res.json();
    expect(body).toMatchObject({ ok: true, flipped: 2, slugs: ['a-slug', 'b-slug'] });
  });

  it('short-circuits with flipped 0 when nothing is due', async () => {
    (queries.loadDuePosts as any).mockResolvedValue([]);
    const { GET } = await import('../routes/admin/api/cron/publish/+server.js');

    const res = await GET(authedRequest());
    const body = await res.json();
    expect(body).toEqual({ ok: true, flipped: 0 });
    expect(admin.publishPost).not.toHaveBeenCalled();
    expect(publish.revalidatePaths).not.toHaveBeenCalled();
  });
});
