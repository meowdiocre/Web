import { json, error } from '@sveltejs/kit';
import { timingSafeEqual } from 'node:crypto';

import { publishDuePosts } from '$lib/server/db/admin-queries';
import { getPostTagSlugs } from '$lib/server/db/admin-taxonomy';
import { revalidateTaxonomyChange } from '$lib/server/publish';

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
  const due = await publishDuePosts(now);

  if (!due.length) {
    return json({ ok: true, flipped: 0 });
  }

  const tagSlugs = await Promise.all(due.map((post) => getPostTagSlugs(post.id)));
  await revalidateTaxonomyChange({
    posts: due.map((post, index) => ({
      slug: post.slug,
      status: 'published',
      category: post.category,
      tagSlugs: tagSlugs[index]
    }))
  });

  return json({ ok: true, flipped: due.length, slugs: due.map((p) => p.slug) });
}

export const POST = GET;
