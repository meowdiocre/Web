import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('$lib/server/db/public-graph', () => ({
  loadPublicKnowledgeGraph: vi.fn()
}));

const publicGraph = await import('$lib/server/db/public-graph');
const graphRoute = await import('../routes/blog/graph/+page.server');

describe('/blog/graph', () => {
  beforeEach(() => vi.clearAllMocks());

  it('loads the public graph with cache headers', async () => {
    const graph = {
      taxonomyNodes: [],
      taxonomyLinks: [],
      articleNodes: [],
      articleLinks: [],
      articleIdsByTaxonomy: {}
    };
    vi.mocked(publicGraph.loadPublicKnowledgeGraph).mockResolvedValue(graph);
    const setHeaders = vi.fn();

    const result = await graphRoute.load({ setHeaders } as any);
    if (!result) throw new Error('Expected graph route data.');

    expect(result.graph).toBe(graph);
    expect(setHeaders).toHaveBeenCalledWith(expect.objectContaining({
      'cache-control': expect.stringContaining('s-maxage=300')
    }));
  });
});
