import { json, error } from '@sveltejs/kit';
import { and, eq, lte, isNotNull } from 'drizzle-orm';

import { db }    from '$lib/server/db/client';
import { posts } from '$lib/server/db/schema';
import { revalidatePaths } from '$lib/server/publish';

export const prerender = false;

/**
 * /admin/api/cron/publish — Vercel cron handler.
 *
 * Auth model:
 *  - Vercel cron jobs send `Authorization: Bearer ${CRON_SECRET}`.
 *  - In dev you can hit this manually with the same header to verify.
 *
 * Behavior: for every draft whose `publish_at` <= now, flip status to
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
  const due = await db
    .select({ id: posts.id, slug: posts.slug })
    .from(posts)
    .where(and(
      eq(posts.status, 'draft'),
      isNotNull(posts.publishAt),
      lte(posts.publishAt, now)
    ));

  if (!due.length) {
    return json({ ok: true, flipped: 0 });
  }

  for (const p of due) {
    await db.update(posts)
      .set({ status: 'published', publishedAt: now, updatedAt: now })
      .where(eq(posts.id, p.id));
  }

  await revalidatePaths([
    '/blog',
    '/feed.xml',
    ...due.map((p) => `/article/${p.slug}`)
  ]);

  return json({ ok: true, flipped: due.length, slugs: due.map((p) => p.slug) });
}

/** POST mirror so the manual trigger from a curl works with either verb. */
export const POST = GET;
