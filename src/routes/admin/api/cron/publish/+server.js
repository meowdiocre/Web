import { json, error } from '@sveltejs/kit';

import { loadDuePosts } from '$lib/server/db/queries';
import { publishPost } from '$lib/server/db/admin-queries';
import { revalidatePaths } from '$lib/server/publish';

export const prerender = false;

/**
 * `/admin/api/cron/publish` is the Vercel cron handler.
 *
 * Auth: Vercel sends `Authorization: Bearer ${CRON_SECRET}`. Use the
 * same header from `curl` in dev to trigger manually.
 *
 * Behaviour: for every draft whose `publish_at <= now`, flip status to
 * 'published', stamp `published_at`, and queue a revalidation.
 *
 * @type {import('./$types').RequestHandler}
 */
export async function GET({ request }) {
  const secret = process.env.CRON_SECRET;
  const auth = request.headers.get('authorization') ?? '';
  if (!secret || auth !== `Bearer ${secret}`) {
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
    ...due.map((p) => `/article/${p.slug}`)
  ]);

  return json({ ok: true, flipped: due.length, slugs: due.map((p) => p.slug) });
}

/** Mirror as POST so manual curl works with either verb. */
export const POST = GET;
