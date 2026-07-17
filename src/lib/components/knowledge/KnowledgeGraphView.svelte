<script>
  import KnowledgeGraphCanvas from './KnowledgeGraphCanvas.svelte';
  import KnowledgeGraphDetails from './KnowledgeGraphDetails.svelte';
  import KnowledgeGraphToolbar from './KnowledgeGraphToolbar.svelte';
  import { getVisibleKnowledgeGraph } from '$lib/knowledge/graph';

  /** @typedef {import('$lib/knowledge/graph').KnowledgeGraphModel} KnowledgeGraphModel */
  /** @typedef {{ graph: KnowledgeGraphModel }} Props */

  /** @type {Props} */
  let { graph } = $props();

  let selectedId = $state(null);
  let expandedId = $state(null);
  let focusVersion = $state(0);

  const allNodes = $derived([...graph.taxonomyNodes, ...graph.articleNodes]);
  const visible = $derived(getVisibleKnowledgeGraph(graph, expandedId, selectedId));
  const selectedNode = $derived(allNodes.find((node) => node.id === selectedId) ?? null);
  const relatedArticleIds = $derived(new Set(
    selectedNode && selectedNode.type !== 'article'
      ? graph.articleIdsByTaxonomy[selectedNode.id] ?? []
      : []
  ));
  const relatedArticles = $derived(
    graph.articleNodes.filter((node) => relatedArticleIds.has(node.id))
  );

  /** @param {string} id */
  function selectNode(id) {
    const node = allNodes.find((candidate) => candidate.id === id);
    if (!node) return;

    selectedId = id;
    if (node.type !== 'article') {
      expandedId = id;
    } else {
      expandedId = graph.articleLinks.find((link) =>
        link.source === id && link.target.startsWith('category:')
      )?.target ?? expandedId;
    }
    focusVersion += 1;
  }

  function resetGraph() {
    selectedId = null;
    expandedId = null;
    focusVersion += 1;
  }

  function closeDetails() {
    selectedId = null;
  }
</script>

<section class="border-y border-paper-ink-strong bg-paper" aria-label="Knowledge graph explorer">
  <KnowledgeGraphToolbar
    nodes={allNodes}
    {selectedId}
    onSelect={selectNode}
    onReset={resetGraph}
  />

  {#if graph.taxonomyNodes.length === 0}
    <div class="grid min-h-[430px] place-items-center px-5 text-center">
      <div class="max-w-[46ch]">
        <h2 class="font-display text-[28px] lowercase text-paper-ink-strong">nothing connected yet.</h2>
        <p class="mt-3 font-serif text-[16px] text-paper-ink-soft">
          Publish articles with categories and tags to build the graph.
        </p>
      </div>
    </div>
  {:else}
    <div class="grid min-h-0 grid-cols-[minmax(0,1fr)_300px] max-[800px]:grid-cols-1">
      <div class="min-w-0">
        <KnowledgeGraphCanvas
          nodes={visible.nodes}
          links={visible.links}
          {selectedId}
          {focusVersion}
          onSelect={selectNode}
        />
        <div class="flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-[var(--rule)] px-3 py-2 font-mono text-[10px] text-muted-warm max-[600px]:text-[11px]">
          <span class="inline-flex items-center gap-2"><i class="h-3 w-3 bg-crimson-deep" aria-hidden="true"></i>category</span>
          <span class="inline-flex items-center gap-2"><i class="h-2.5 w-2.5 rotate-45 bg-paper-ink-strong" aria-hidden="true"></i>tag</span>
          <span class="inline-flex items-center gap-2"><i class="h-2.5 w-2.5 rounded-full border-2 border-crimson-deep" aria-hidden="true"></i>article</span>
          <span class="ml-auto max-[520px]:ml-0">{visible.nodes.length} nodes · {visible.links.length} links</span>
        </div>
      </div>

      {#if selectedNode}
        <KnowledgeGraphDetails
          node={selectedNode}
          {relatedArticles}
          onClose={closeDetails}
        />
      {:else}
        <aside class="hidden border-l border-[var(--rule)] p-5 min-[801px]:block" aria-label="Graph instructions">
          <p class="font-mono text-[10px] text-muted-warm">how to use</p>
          <p class="mt-3 font-serif text-[16px] leading-[1.55] text-paper-ink-soft">
            Select a category or tag to reveal its articles. Drag nodes to inspect dense areas. Scroll or use the controls to zoom.
          </p>
        </aside>
      {/if}
    </div>
  {/if}
</section>
