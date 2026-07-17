<script>
  import PixelIcon from '$lib/components/PixelIcon.svelte';

  /** @typedef {import('$lib/knowledge/graph').KnowledgeGraphNode} KnowledgeGraphNode */
  /** @typedef {{ nodes?: KnowledgeGraphNode[], selectedId?: string | null, onSelect?: (id: string) => void, onReset?: () => void }} Props */

  /** @type {Props} */
  let { nodes = [], selectedId = null, onSelect, onReset } = $props();

  let query = $state('');
  const normalizedQuery = $derived(query.trim().toLowerCase());
  const results = $derived(
    normalizedQuery
      ? nodes
          .filter((node) => `${node.label} ${node.type}`.toLowerCase().includes(normalizedQuery))
          .sort((a, b) => Number(b.id === selectedId) - Number(a.id === selectedId)
            || b.postCount - a.postCount
            || a.label.localeCompare(b.label))
          .slice(0, 8)
      : []
  );

  /** @param {KnowledgeGraphNode} node */
  function resultLabel(node) {
    if (node.type === 'article') return `${node.label}, article`;
    return `${node.label}, ${node.type}, ${node.postCount} ${node.postCount === 1 ? 'article' : 'articles'}`;
  }

  /** @param {string} id */
  function select(id) {
    query = '';
    onSelect?.(id);
  }
</script>

<div class="relative z-20 flex min-h-14 items-center gap-2 border-b border-[var(--rule)] px-3 max-[640px]:flex-wrap max-[640px]:py-2">
  <form class="group/search relative min-w-0 flex-1" role="search" onsubmit={(event) => event.preventDefault()}>
    <label class="sr-only" for="graph-search">Search graph</label>
    <span class="pointer-events-none absolute inset-y-0 left-0 inline-flex items-center text-crimson-deep" aria-hidden="true">
      <PixelIcon name="search" size={15} />
    </span>
    <input
      id="graph-search"
      class="h-11 w-full border-0 border-b border-transparent bg-transparent pr-10 pl-6 font-mono text-[13px] text-paper-ink-strong placeholder:text-muted-warm focus:border-crimson-deep focus:outline-none"
      type="search"
      placeholder="find category, tag, or article"
      bind:value={query}
      autocomplete="off"
      spellcheck="false"
    />
    {#if query}
      <button
        type="button"
        class="absolute inset-y-0 right-0 inline-flex min-h-11 min-w-11 cursor-pointer items-center justify-center text-muted-warm transition-colors duration-150 hover:text-crimson-deep"
        onclick={() => (query = '')}
        aria-label="Clear graph search"
      >
        <PixelIcon name="close" size={14} />
      </button>
    {/if}

    {#if results.length > 0}
      <div
        id="graph-search-results"
        class="absolute top-[calc(100%+6px)] left-0 w-full max-w-[520px] border border-paper-ink-strong bg-paper shadow-hard-sm"
        role="list"
        aria-label="Graph search results"
      >
        {#each results as node (node.id)}
          <button
            type="button"
            class="flex min-h-12 w-full cursor-pointer items-center gap-3 border-b border-[var(--rule-soft)] px-3 text-left last:border-b-0 hover:bg-paper-2/60 focus-visible:bg-paper-2/60"
            class:bg-paper-2={node.id === selectedId}
            onclick={() => select(node.id)}
            aria-label={resultLabel(node)}
          >
            <span class="inline-flex h-7 w-7 shrink-0 items-center justify-center border border-paper-ink-strong text-crimson-deep" aria-hidden="true">
              <PixelIcon name={node.icon} size={14} />
            </span>
            <span class="min-w-0 flex-1 truncate font-mono text-[12px] text-paper-ink-strong">{node.label}</span>
            <span class="shrink-0 font-mono text-[10px] text-muted-warm max-[600px]:text-[11px]">{node.type}</span>
          </button>
        {/each}
      </div>
    {/if}
  </form>

  <button
    type="button"
    class="inline-flex min-h-11 cursor-pointer items-center gap-2 border border-paper-ink-strong px-3 font-mono text-[11px] text-paper-ink-strong transition-colors duration-150 hover:bg-paper-ink-strong hover:text-paper"
    onclick={onReset}
  >
    <PixelIcon name="target" size={14} />
    <span class="max-[420px]:sr-only">reset</span>
  </button>
</div>
