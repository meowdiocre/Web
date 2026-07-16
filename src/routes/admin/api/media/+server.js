import { error, json } from '@sveltejs/kit';
import { put } from '@vercel/blob';
import { env } from '$env/dynamic/private';

import { createMedia } from '$lib/server/db/media-queries';
import { mediaContentError, mediaUploadError } from '$lib/server/media-upload';

export const prerender = false;

/** @type {import('./$types').RequestHandler} */
export async function POST({ request, locals }) {
  if (!locals.user) error(401, 'Not signed in.');

  let form;
  try {
    form = await request.formData();
  } catch {
    error(400, 'Body must be multipart form data.');
  }
  const file = form.get('file');
  if (!(file instanceof File)) error(400, 'No file field.');
  const purpose = form.get('purpose') === 'thumbnail' ? 'thumbnail' : 'editor';
  const uploadError = mediaUploadError(file, purpose);
  if (uploadError) error(uploadError.status, uploadError.message);
  const contentError = await mediaContentError(file);
  if (contentError) error(contentError.status, contentError.message);

  const token = env.BLOB_READ_WRITE_TOKEN;
  if (!token) {
    error(500, 'BLOB_READ_WRITE_TOKEN is not configured; enable Vercel Blob.');
  }

  const safe = file.name.replace(/[^a-zA-Z0-9.\-_]/g, '_').slice(0, 80) || 'upload';
  let blob;
  try {
    blob = await put(`uploads/${safe}`, file, {
      access: 'public',
      addRandomSuffix: true,
      contentType: file.type,
      token
    });
  } catch (cause) {
    console.error('[media] Vercel Blob upload failed:', cause instanceof Error ? cause.message : 'Unknown error');
    error(502, 'Media storage rejected the upload. Verify the Vercel Blob store and token.');
  }

  const row = await createMedia({
    url:        blob.url,
    pathname:   blob.pathname,
    mime:       file.type,
    bytes:      file.size,
    uploadedBy: locals.user.id
  });

  return json(row);
}
