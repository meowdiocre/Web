import { error, json } from '@sveltejs/kit';
import { put } from '@vercel/blob';
import { env } from '$env/dynamic/private';

import { createMedia } from '$lib/server/db/media-queries';
import { mediaUploadError } from '$lib/server/media-upload';

export const prerender = false;

/** @type {import('./$types').RequestHandler} */
export async function POST({ request, locals }) {
  if (!locals.user) error(401, 'Not signed in.');

  const form = await request.formData();
  const file = form.get('file');
  if (!(file instanceof File)) error(400, 'No file field.');
  const purpose = form.get('purpose') === 'thumbnail' ? 'thumbnail' : 'editor';
  const uploadError = mediaUploadError(file, purpose);
  if (uploadError) error(uploadError.status, uploadError.message);

  const token = env.BLOB_READ_WRITE_TOKEN;
  if (!token) {
    error(500, 'BLOB_READ_WRITE_TOKEN is not configured; enable Vercel Blob.');
  }

  const safe = file.name.replace(/[^a-zA-Z0-9.\-_]/g, '_').slice(0, 80) || 'upload';
  const blob = await put(`uploads/${safe}`, file, {
    access: 'public',
    addRandomSuffix: true,
    contentType: file.type,
    token
  });

  const row = await createMedia({
    url:        blob.url,
    pathname:   blob.pathname,
    mime:       file.type,
    bytes:      file.size,
    uploadedBy: locals.user.id
  });

  return json(row);
}
