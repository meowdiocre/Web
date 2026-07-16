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

vi.mock('$lib/server/db/admin-queries', () => ({
  publishDuePosts: vi.fn()
}));
vi.mock('$lib/server/db/admin-taxonomy', () => ({
  getPostTagSlugs: vi.fn()
}));
vi.mock('$lib/server/publish', async () => {
  const real = await vi.importActual<typeof import('$lib/server/publish')>('$lib/server/publish');
  return {
    ...real,
    revalidatePaths: vi.fn().mockResolvedValue(undefined),
    revalidateTaxonomyChange: vi.fn().mockResolvedValue(undefined)
  };
});

const admin   = await import('$lib/server/db/admin-queries');
const taxonomy = await import('$lib/server/db/admin-taxonomy');
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

  it('atomically flips due posts and revalidates their routes', async () => {
    const due = [
      { id: 'p1', slug: 'a-slug', category: 'reverse' },
      { id: 'p2', slug: 'b-slug', category: 'windows' }
    ];
    (admin.publishDuePosts as any).mockResolvedValue(due);
    (taxonomy.getPostTagSlugs as any).mockImplementation(async (id: string) => id === 'p1' ? ['security'] : ['windows']);

    const { GET } = await import('../routes/admin/api/cron/publish/+server.js');
    const res = await GET(authedRequest());

    expect(admin.publishDuePosts).toHaveBeenCalledOnce();
    expect(admin.publishDuePosts).toHaveBeenCalledWith(expect.any(Date));

    expect(publish.revalidateTaxonomyChange).toHaveBeenCalledWith({
      posts: [
        { slug: 'a-slug', status: 'published', category: 'reverse', tagSlugs: ['security'] },
        { slug: 'b-slug', status: 'published', category: 'windows', tagSlugs: ['windows'] }
      ]
    });

    const body = await res.json();
    expect(body).toMatchObject({ ok: true, flipped: 2, slugs: ['a-slug', 'b-slug'] });
  });

  it('short-circuits with flipped 0 when nothing is due', async () => {
    (admin.publishDuePosts as any).mockResolvedValue([]);
    const { GET } = await import('../routes/admin/api/cron/publish/+server.js');

    const res = await GET(authedRequest());
    const body = await res.json();
    expect(body).toEqual({ ok: true, flipped: 0 });
    expect(admin.publishDuePosts).toHaveBeenCalledOnce();
    expect(publish.revalidateTaxonomyChange).not.toHaveBeenCalled();
  });
});
