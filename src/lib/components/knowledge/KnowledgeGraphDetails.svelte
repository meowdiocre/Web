<script>
  import PixelIcon from '$lib/components/PixelIcon.svelte';

  /** @typedef {import('$lib/knowledge/graph').KnowledgeGraphNode} KnowledgeGraphNode */
  /** @typedef {{ node?: KnowledgeGraphNode | null, relatedArticles?: KnowledgeGraphNode[], onClose?: () => void }} Props */

  /** @type {Props} */
  let { node = null, relatedArticles = [], onClose } = $props();

  const archiveLabel = $derived(
    node?.type === 'category'
      ? 'Open category archive'
      : node?.type === 'tag'
        ? 'Open tag archive'
        : 'Read article'
  );
</script>

{#if node}
  <aside
    class="min-[801px]:relative min-[801px]:h-full min-[801px]:border-l min-[801px]:border-[var(--rule)] max-[800px]:fixed max-[800px]:right-0 max-[800px]:bottom-[calc(68px+env(safe-area-inset-bottom))] max-[800px]:left-0 max-[800px]:z-40 max-[800px]:max-h-[min(58vh,520px)] max-[800px]:border-t max-[800px]:border-paper-ink-strong max-[800px]:bg-paper max-[800px]:shadow-[0_-4px_0_rgb(36_24_20_/_0.18)]"
    aria-label="Graph selection"
  >
    <div class="flex h-full min-h-0 flex-col overflow-hidden bg-paper">
      <div class="flex items-start gap-3 border-b border-[var(--rule)] p-4">
        <span class="inline-flex h-9 w-9 shrink-0 items-center justify-center border border-paper-ink-strong text-crimson-deep" aria-hidden="true">
          <PixelIcon name={node.icon} size={18} />
        </span>
        <div class="min-w-0 flex-1">
          <p class="mb-1 font-mono text-[10px] text-muted-warm max-[600px]:text-[11px]">{node.type}</p>
          <h2 class="text-wrap-balance font-display text-[clamp(20px,2vw,28px)] leading-[1.05] lowercase text-paper-ink-strong">
            {node.label}
          </h2>
        </div>
        <button
          type="button"
          class="inline-flex min-h-11 min-w-11 cursor-pointer items-center justify-center text-muted-warm transition-colors duration-150 hover:text-crimson-deep"
          onclick={onClose}
          aria-label="Close graph details"
        >
          <PixelIcon name="close" size={15} />
        </button>
      </div>

      <div class="min-h-0 flex-1 overflow-y-auto p-4">
        {#if node.type !== 'article'}
          <p class="font-serif text-[16px] leading-[1.5] text-paper-ink-soft">
            {node.postCount} published {node.postCount === 1 ? 'article' : 'articles'} connected to this {node.type}.
          </p>

          {#if relatedArticles.length > 0}
            <nav class="mt-5" aria-label="Related articles">
              <p class="mb-2 font-mono text-[10px] text-muted-warm max-[600px]:text-[11px]">connected articles</p>
              <ul class="border-t border-[var(--rule)]">
                {#each relatedArticles as article (article.id)}
                  <li class="border-b border-[var(--rule-soft)]">
                    <a
                      class="group flex min-h-12 items-center gap-2 py-2 font-mono text-[12px] leading-[1.35] text-paper-ink-strong transition-colors duration-150 hover:text-crimson-deep"
                      href={article.href}
                    >
                      <PixelIcon name="article" size={13} class="shrink-0 text-crimson-deep" />
                      <span class="min-w-0 flex-1">{article.label}</span>
                      <PixelIcon name="arrow-right" size={12} class="shrink-0 opacity-55 transition-transform duration-150 group-hover:translate-x-0.5" />
                    </a>
                  </li>
                {/each}
              </ul>
            </nav>
          {/if}
        {:else}
          <p class="font-serif text-[16px] leading-[1.5] text-paper-ink-soft">
            Open the article to read the full entry.
          </p>
        {/if}
      </div>

      <div class="border-t border-[var(--rule)] p-4">
        <a
          class="inline-flex min-h-11 w-full items-center justify-between gap-3 border border-paper-ink-strong px-3 font-mono text-[11px] text-paper-ink-strong transition-colors duration-150 hover:bg-paper-ink-strong hover:text-paper"
          href={node.href}
        >
          {archiveLabel}
          <PixelIcon name="external-link" size={13} />
        </a>
      </div>
    </div>
  </aside>
{/if}
