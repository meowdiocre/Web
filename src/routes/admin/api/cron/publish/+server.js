import { json, error } from '@sveltejs/kit';
import { timingSafeEqual } from 'node:crypto';

import { articlePath } from '$lib/blog/urls';
import { loadDuePosts } from '$lib/server/db/queries';
import { publishPost } from '$lib/server/db/admin-queries';
import { revalidatePaths } from '$lib/server/publish';

export const prerender = false;

/** @param {string} a @param {string} b */
function secretMatches(a, b) {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ab.length !== bb.length) return false;
  if (ab.length === 0) return false;
  return timingSafeEqual(ab, bb);
}

/** @type {import('./$types').RequestHandler} */
export async function GET({ request }) {
  const secret = process.env.CRON_SECRET;
  const auth = request.headers.get('authorization') ?? '';
  if (!secret || !secretMatches(auth, `Bearer ${secret}`)) {
    error(401, 'Bad cron secret.');
  }

  const now = new Date();
  const due = await loadDuePosts(now);

  if (!due.length) {
    return json({ ok: true, flipped: 0 });
  }

  for (const p of due) {
    await publishPost(p.id);
  }

  await revalidatePaths([
    '/blog',
    '/feed.xml',
    ...due.map((post) => articlePath(post.category, post.slug))
  ]);

  return json({ ok: true, flipped: due.length, slugs: due.map((p) => p.slug) });
}

export const POST = GET;
