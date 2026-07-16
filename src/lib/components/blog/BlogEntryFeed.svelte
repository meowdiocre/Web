<script>
  import EntryItem from '$lib/components/EntryItem.svelte';
  import EntriesYear from '$lib/components/EntriesYear.svelte';
  import PixelIcon from '$lib/components/PixelIcon.svelte';
  import { hoverSpring } from '$lib/motion/hover';

  /** @typedef {import('$lib/server/db/queries').EntryGroup} EntryGroup */
  /** @typedef {{ entryGroups?: EntryGroup[], filteredCount?: number, visibleCount?: number, remainingCount?: number, onShowMore?: () => void }} Props */

  /** @type {Props} */
  let {
    entryGroups = [],
    filteredCount = 0,
    visibleCount = 0,
    remainingCount = 0,
    onShowMore = () => {}
  } = $props();
</script>

<section class="px-[var(--gutter)] pt-3 pb-[clamp(72px,9vw,112px)]" aria-label="Entries">
  <div class="mx-auto max-w-[880px]">
    {#if filteredCount === 0}
      <div class="grid gap-1.5 border-t border-[var(--rule)] pt-8 pb-2" role="status" aria-live="polite">
        <p class="m-0 font-mono text-[10px] tracking-[0.18em] uppercase text-crimson-deep">0/{filteredCount}</p>
        <p class="m-0 max-w-[52ch] font-serif text-[17px] leading-[1.45] text-muted-warm text-pretty">
          nothing matched. try a broader keyword or clear the filter.
        </p>
      </div>
    {:else}
      {#each entryGroups as group}
        <EntriesYear year={group.year} count={group.entries.length} />
        {#each group.entries as entry, i (entry.href)}
          <EntryItem {...entry} revealDelay={Math.min(i, 4) * 0.05} />
        {/each}
      {/each}

      <div
        class="mt-7 flex items-center justify-between gap-4 border-t border-[var(--rule)] pt-3.5 font-mono text-[11px] text-muted-warm max-[600px]:flex-col max-[600px]:items-start max-[600px]:gap-3"
      >
        {#if remainingCount > 0}
          <span class="tracking-[0.14em] opacity-75">{visibleCount}/{filteredCount}</span>
          <button
            type="button"
            class="group/more inline-flex cursor-pointer items-center gap-2 border-0 bg-transparent py-1 font-mono text-[11px] tracking-[0.06em] text-crimson-deep transition-[color,transform] duration-[120ms] ease-out hover:text-crimson focus-visible:text-crimson focus-visible:outline-none"
            onclick={onShowMore}
            use:hoverSpring={{ scale: 1.02, press: 0.98 }}
          >
            <span>load {Math.min(remainingCount, 12)} more</span>
            <PixelIcon
              name="arrow-right"
              size={12}
              class="transition-transform duration-[120ms] ease-out group-hover/more:translate-x-0.5 group-focus-visible/more:translate-x-0.5"
            />
          </button>
        {:else}
          <span class="tracking-[0.14em] opacity-75">{visibleCount}/{filteredCount}</span>
          <span class="tracking-[0.32em] uppercase text-crimson-deep opacity-85" aria-label="end of feed">eof</span>
        {/if}
      </div>
    {/if}
  </div>
</section>
