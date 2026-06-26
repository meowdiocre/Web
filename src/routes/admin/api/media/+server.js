import { error, json } from '@sveltejs/kit';
import { put } from '@vercel/blob';

import { db } from '$lib/server/db/client';
import { media } from '$lib/server/db/schema';

export const prerender = false;

const MAX_BYTES = 8 * 1024 * 1024;
const ALLOWED   = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/svg+xml', 'image/gif']);

/** @type {import('./$types').RequestHandler} */
export async function POST({ request, locals }) {
  if (!locals.user) error(401, 'Not signed in.');

  const form = await request.formData();
  const file = form.get('file');
  if (!(file instanceof File)) error(400, 'No file field.');
  if (file.size > MAX_BYTES) error(413, `File too large: ${file.size} > ${MAX_BYTES}.`);
  if (!ALLOWED.has(file.type)) error(415, `Unsupported type: ${file.type}.`);

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    error(500, 'BLOB_READ_WRITE_TOKEN is not configured; enable Vercel Blob.');
  }

  const safe = file.name.replace(/[^a-zA-Z0-9.\-_]/g, '_').slice(0, 80) || 'upload';
  const blob = await put(`uploads/${safe}`, file, {
    access: 'public',
    addRandomSuffix: true,
    contentType: file.type
  });

  const [row] = await db
    .insert(media)
    .values({
      url:      blob.url,
      pathname: blob.pathname,
      mime:     file.type,
      bytes:    file.size,
      width:    null,
      height:   null,
      uploadedBy: locals.user.id
    })
    .returning();

  return json({
    id:       row.id,
    url:      blob.url,
    pathname: blob.pathname,
    mime:     file.type,
    bytes:    file.size
  });
}
