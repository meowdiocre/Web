<script>
  import EntryItem from '$lib/components/EntryItem.svelte';
  import EntriesYear from '$lib/components/EntriesYear.svelte';

  /** @typedef {{ year: number, entries: any[] }} EntryGroup */
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
        <p class="empty__eyebrow">No matches</p>
        <h2>Nothing matched that search.</h2>
        <p>Try a broader keyword or switch back to all categories.</p>
      </div>
    {:else}
      {#each entryGroups as group}
        <EntriesYear year={group.year} count={group.entries.length} />
        {#each group.entries as entry (entry.href)}
          <EntryItem {...entry} />
        {/each}
      {/each}

      <div class="footer">
        <p>Loaded {visibleCount} of {filteredCount} matching entries.</p>

        {#if remainingCount > 0}
          <button type="button" class="show-more" onclick={onShowMore}>
            show {Math.min(remainingCount, 12)} more
          </button>
        {:else}
          <p class="footer__done">Archive segment complete.</p>
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
    gap: 8px;
    padding: 22px;
    border: 1px dashed var(--rule);
    background: rgb(255 255 255 / 0.24);
    text-align: left;
  }

  .empty__eyebrow,
  .footer,
  .footer__done {
    font-family: var(--font-mono);
    letter-spacing: 0.12em;
    text-transform: uppercase;
  }

  .empty__eyebrow {
    margin: 0;
    font-size: 10px;
    color: var(--color-muted-warm);
  }

  .empty h2 {
    margin: 0;
    font-family: var(--font-display);
    font-size: clamp(20px, 2.2vw, 28px);
    line-height: 1.02;
    color: #2a1c14;
    text-transform: uppercase;
  }

  .empty p:last-child {
    margin: 0;
    max-width: 48ch;
    font-family: var(--font-serif);
    font-size: 16px;
    line-height: 1.45;
    color: var(--color-muted-warm);
  }

  .footer {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: 10px 16px;
    margin-top: 22px;
    padding-top: 14px;
    border-top: 1px dashed var(--rule);
    font-size: 10px;
    color: var(--color-muted-warm);
  }

  .footer p {
    margin: 0;
  }

  .footer__done {
    color: var(--color-crimson-deep);
  }

  .show-more {
    min-height: 36px;
    padding: 0 12px;
    border: 1px solid var(--rule);
    background: transparent;
    color: #2a1c14;
    font-family: var(--font-mono);
    font-size: 10px;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    cursor: pointer;
    transition: background 0.12s ease, color 0.12s ease, border-color 0.12s ease;
  }

  .show-more:hover,
  .show-more:focus-visible {
    background: rgb(200 58 61 / 0.08);
    color: var(--color-crimson-deep);
    border-color: rgb(142 42 39 / 0.34);
    outline: none;
  }

  @media (max-width: 600px) {
    .footer {
      align-items: flex-start;
      flex-direction: column;
      gap: 10px;
      font-size: 10px;
    }

    .show-more {
      width: 100%;
    }

    .empty p:last-child {
      font-size: 16px;
    }
  }
</style>
