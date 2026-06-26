import { error, json } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';

import { db } from '$lib/server/db/client';
import { posts } from '$lib/server/db/schema';
import { renderPost } from '$lib/server/render-post';
import { isDoc } from '$lib/editor/types';

export const prerender = false;

/** @type {import('./$types').RequestHandler} */
export async function PATCH({ request, params, locals }) {
  if (!locals.user) error(401, 'Not signed in.');

  let payload;
  try {
    payload = await request.json();
  } catch {
    error(400, 'Body must be JSON.');
  }

  if (!isDoc(payload?.docJson)) {
    error(400, 'docJson must be a TipTap document.');
  }

  const { bodyHtml, doc } = await renderPost(payload.docJson);

  await db
    .update(posts)
    .set({
      docJson:  doc,
      bodyHtml,
      updatedAt: new Date()
    })
    .where(eq(posts.id, params.id));

  return json({ ok: true, bytes: bodyHtml.length });
}
