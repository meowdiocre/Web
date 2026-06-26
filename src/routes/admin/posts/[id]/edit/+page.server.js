import { error } from '@sveltejs/kit';
import { getPostById } from '$lib/server/db/admin-queries';

export const prerender = false;
export const ssr       = true;

/** @type {import('./$types').PageServerLoad} */
export async function load({ params }) {
  const post = await getPostById(params.id);
  if (!post) error(404, 'Post not found.');
  return { post };
}
