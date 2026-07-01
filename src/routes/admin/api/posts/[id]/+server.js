import { error, json } from '@sveltejs/kit';

import { savePostContent } from '$lib/server/db/admin-queries';
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
  await savePostContent(params.id, doc, bodyHtml);

  // Echo the rehighlighted doc so the editor can pull new codeBlock.html
  // attrs back in without a page reload.
  return json({ ok: true, bytes: bodyHtml.length, doc });
}
