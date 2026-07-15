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

<section class="entries" aria-label="Entries">
  <div class="entries__inner">
    {#if filteredCount === 0}
      <div class="empty" role="status" aria-live="polite">
        <p class="empty__reg">0/{filteredCount}</p>
        <p class="empty__msg">nothing matched. try a broader keyword or clear the filter.</p>
      </div>
    {:else}
      {#each entryGroups as group}
        <EntriesYear year={group.year} count={group.entries.length} />
        {#each group.entries as entry, i (entry.href)}
          <EntryItem {...entry} revealDelay={Math.min(i, 4) * 0.05} />
        {/each}
      {/each}

      <div class="tail">
        {#if remainingCount > 0}
          <span class="tail__reg">{visibleCount}/{filteredCount}</span>
          <button type="button" class="more" onclick={onShowMore} use:hoverSpring={{ scale: 1.02, press: 0.98 }}>
            <span>load {Math.min(remainingCount, 12)} more</span>
            <PixelIcon name="arrow-right" size={12} />
          </button>
        {:else}
          <span class="tail__reg">{visibleCount}/{filteredCount}</span>
          <span class="tail__eof" aria-label="end of feed">eof</span>
        {/if}
      </div>
    {/if}
  </div>
</section>

<style>
  .entries {
    padding: 12px var(--gutter) clamp(72px, 9vw, 112px);
  }

  .entries__inner {
    max-width: 880px;
    margin: 0 auto;
  }

  .empty {
    display: grid;
    gap: 6px;
    padding: 32px 0 8px;
    border-top: 1px solid var(--rule);
  }

  .empty__reg {
    margin: 0;
    font-family: var(--font-mono);
    font-size: 10px;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: var(--color-crimson-deep);
  }

  .empty__msg {
    margin: 0;
    max-width: 52ch;
    font-family: var(--font-serif);
    font-size: 17px;
    line-height: 1.45;
    color: var(--color-muted-warm);
    text-wrap: pretty;
  }

  .tail {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    margin-top: 28px;
    padding-top: 14px;
    border-top: 1px solid var(--rule);
    font-family: var(--font-mono);
    font-size: 11px;
    color: var(--color-muted-warm);
  }

  .tail__reg {
    letter-spacing: 0.14em;
    opacity: 0.75;
  }

  .tail__eof {
    letter-spacing: 0.32em;
    text-transform: uppercase;
    color: var(--color-crimson-deep);
    opacity: 0.85;
  }

  .more {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 4px 0;
    border: 0;
    background: transparent;
    color: var(--color-crimson-deep);
    font-family: var(--font-mono);
    font-size: 11px;
    letter-spacing: 0.06em;
    cursor: pointer;
    transition: color 0.12s ease, transform 0.12s ease;
  }
  .more :global(.pixel-icon) { transition: transform 0.12s ease; }
  .more:hover,
  .more:focus-visible {
    color: var(--color-crimson);
    outline: none;
  }
  .more:hover :global(.pixel-icon),
  .more:focus-visible :global(.pixel-icon) { transform: translateX(2px); }

  @media (max-width: 600px) {
    .tail {
      align-items: flex-start;
      flex-direction: column;
      gap: 12px;
    }
  }
</style>
