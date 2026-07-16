import { beforeEach, describe, expect, it, vi } from 'vitest';
import { mediaContentError, mediaUploadError } from '$lib/server/media-upload';

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

  it('accepts raster editor images and rejects executable SVG uploads', () => {
    expect(mediaUploadError({ type: 'image/gif', size: 1024 }, 'editor')).toBeNull();
    expect(mediaUploadError({ type: 'image/svg+xml', size: 1024 }, 'editor'))
      .toMatchObject({ status: 415 });
  });

  it('rejects files whose bytes do not match their image type', async () => {
    const file = new File(['<html>not an image</html>'], 'fake.png', { type: 'image/png' });
    await expect(mediaContentError(file)).resolves.toMatchObject({ status: 415 });
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
    form.append('file', new File([new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])], 'thumbnail.png', { type: 'image/png' }));
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

  it('returns 400 for malformed multipart requests', async () => {
    await expect(POST({
      request: new Request('http://localhost/admin/api/media', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: '{}'
      }),
      locals: { user: { id: 'user-1' } }
    } as any)).rejects.toMatchObject({ status: 400 });
  });

  it('returns a safe storage error when Vercel Blob rejects the upload', async () => {
    vi.mocked(blob.put).mockRejectedValue(new Error('Vercel Blob: This store does not exist.'));

    const form = new FormData();
    form.append('file', new File([new Uint8Array([0xff, 0xd8, 0xff])], 'photo.jpg', { type: 'image/jpeg' }));

    await expect(POST({
      request: new Request('http://localhost/admin/api/media', { method: 'POST', body: form }),
      locals: { user: { id: 'user-1' } }
    } as any)).rejects.toMatchObject({ status: 502 });
  });
});
