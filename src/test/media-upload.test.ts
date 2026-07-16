import { beforeEach, describe, expect, it, vi } from 'vitest';
import { mediaUploadError } from '$lib/server/media-upload';

vi.mock('@vercel/blob', () => ({ put: vi.fn() }));
vi.mock('$env/dynamic/private', () => ({
  env: { BLOB_READ_WRITE_TOKEN: 'current-token' }
}));
vi.mock('$lib/server/db/media-queries', () => ({ createMedia: vi.fn() }));

const blob = await import('@vercel/blob');
const mediaQueries = await import('$lib/server/db/media-queries');
const { POST } = await import('../routes/admin/api/media/+server.js');

describe('media upload policy', () => {
  it('accepts a WebP thumbnail below 4 MiB', () => {
    expect(mediaUploadError({ type: 'image/webp', size: 1024 }, 'thumbnail')).toBeNull();
  });

  it('rejects unsupported and oversized thumbnail uploads', () => {
    expect(mediaUploadError({ type: 'image/gif', size: 1024 }, 'thumbnail'))
      .toMatchObject({ status: 415 });
    expect(mediaUploadError({ type: 'image/svg+xml', size: 1024 }, 'thumbnail'))
      .toMatchObject({ status: 415 });
    expect(mediaUploadError({ type: 'image/jpeg', size: 4 * 1024 * 1024 + 1 }, 'thumbnail'))
      .toMatchObject({ status: 413 });
  });

  it('keeps existing editor image rules', () => {
    expect(mediaUploadError({ type: 'image/gif', size: 1024 }, 'editor')).toBeNull();
    expect(mediaUploadError({ type: 'image/svg+xml', size: 1024 }, 'editor')).toBeNull();
  });
});

describe('media upload route', () => {
  beforeEach(() => vi.clearAllMocks());

  it('passes the SvelteKit private token to Vercel Blob', async () => {
    vi.mocked(blob.put).mockResolvedValue({
      url: 'https://example.public.blob.vercel-storage.com/thumbnail.png',
      pathname: 'uploads/thumbnail.png'
    } as any);
    vi.mocked(mediaQueries.createMedia).mockResolvedValue({
      url: 'https://example.public.blob.vercel-storage.com/thumbnail.png'
    } as any);

    const form = new FormData();
    form.append('file', new File(['image'], 'thumbnail.png', { type: 'image/png' }));
    form.append('purpose', 'thumbnail');

    await POST({
      request: new Request('http://localhost/admin/api/media', { method: 'POST', body: form }),
      locals: { user: { id: 'user-1' } }
    } as any);

    expect(blob.put).toHaveBeenCalledWith(
      expect.stringMatching(/^uploads\//),
      expect.any(File),
      expect.objectContaining({ token: 'current-token' })
    );
  });
});
