import { loadPublicEntries } from '$lib/server/db/queries';

/** @type {import('./$types').PageServerLoad} */
export async function load({ setHeaders }) {
  const entryGroups = await loadPublicEntries();
  setHeaders({
    'cache-control': 'public, max-age=0, s-maxage=300, stale-while-revalidate=86400'
  });
  return { entryGroups };
}
