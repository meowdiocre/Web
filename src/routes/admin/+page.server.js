import { listPostsForAdmin } from '$lib/server/db/admin-queries';

export const prerender = false;

/** @type {import('./$types').PageServerLoad} */
export async function load() {
  const posts = await listPostsForAdmin();
  return { posts };
}
