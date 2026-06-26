import { redirect } from '@sveltejs/kit';

/** @type {import('./$types').PageServerLoad} */
export function load() {
  redirect(308, '/article/vmprotect-3x-devirt');
}
