import { loadPublicKnowledgeGraph } from '$lib/server/db/public-graph';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ setHeaders }) => {
  setHeaders({
    'cache-control': 'public, max-age=0, s-maxage=300, stale-while-revalidate=86400'
  });

  return { graph: await loadPublicKnowledgeGraph() };
};
