<script>
  import { SITE }      from '$lib/config/site.js';
  import Nav           from '$lib/components/Nav.svelte';
  import Footer        from '$lib/components/Footer.svelte';
  import SkipLink      from '$lib/components/SkipLink.svelte';
  import PageKicker    from '$lib/components/PageKicker.svelte';
  import PageTitle     from '$lib/components/PageTitle.svelte';
  import Lede          from '$lib/components/Lede.svelte';
  import Polaroid      from '$lib/components/Polaroid.svelte';
  import EntryItem     from '$lib/components/EntryItem.svelte';
  import EntriesYear   from '$lib/components/EntriesYear.svelte';

  /** @type {{ data: { entryGroups: { year: number, entries: any[] }[] } }} */
  let { data } = $props();
  const entryGroups = $derived(data.entryGroups ?? []);
</script>

<svelte:head>
  <title>Writing — {SITE.brand}</title>
  <meta
    name="description"
    content="Long-form essays and lab notes on Windows internals, anti-cheat, browser sandboxes, and large model behavior."
  />
</svelte:head>

<SkipLink target="#journal-title" />

<Nav current="writing" />

<main class="layer">
  <!-- Head: title + lede on the left, polaroid on the right, epigraph below -->
  <section class="head" aria-labelledby="journal-title">
    <div class="head__inner">
      <div class="min-w-0">
        <PageKicker label="Long-form & lab notes" tone="muted-warm" />
        <PageTitle text="writing" id="journal-title" tone="ink" dotTone="crimson-deep" />
        <Lede palette="ink">
          Long-form essays and lab notes on reverse engineering, OS internals, anti-cheat infrastructure, web exploitation, and breaking the capitalist tech giants
        </Lede>
      </div>

      <div class="head__pol">
        <Polaroid src="/rei.jpg" alt="" prompt=">" caption="page_fault" rotate={-2.4} />
      </div>

      <aside class="epigraph" role="note" aria-label="Epigraph">
        <span class="mark" aria-hidden="true">∅—</span>
        <p class="line">Learn the rules like an expert. <em>so you can break them like an artist
.</em></p>
      </aside>
    </div>
  </section>

  <!-- Year-grouped entry list -->
  <section class="entries" aria-label="Entries">
    <div class="entries__inner">
      {#each entryGroups as group}
        <EntriesYear year={group.year} count={group.entries.length} />
        {#each group.entries as e}
          <EntryItem {...e} />
        {/each}
      {/each}

      <div class="close" role="note" aria-label="End of feed">
        <span><span class="mark" aria-hidden="true">▮</span>end of transmission · the wire continues elsewhere</span>
        <span class="tracking-[0.20em]" aria-hidden="true">no signal · 23:47</span>
      </div>
    </div>
  </section>
</main>

<Footer variant="paper" />

<style>
  .head { padding: clamp(56px, 9vw, 112px) var(--gutter) clamp(28px, 4vw, 48px); }
  .head__inner {
    max-width: 880px;
    margin: 0 auto;
    display: grid;
    grid-template-columns: minmax(0, 1.45fr) minmax(0, 0.95fr);
    gap: clamp(28px, 4.5vw, 64px);
    align-items: start;
  }
  .head__pol {
    align-self: start;
    margin-top: 4px;
    width: 100%;
    max-width: 360px;
    justify-self: end;
  }

  .epigraph {
    grid-column: 1 / -1;
    margin-top: 38px;
    padding-top: 22px;
    border-top: 1px dashed var(--rule);
    display: grid;
    grid-template-columns: 24px 1fr;
    gap: 16px;
    align-items: baseline;
    max-width: 58ch;
  }
  .epigraph .mark {
    font-family: var(--font-mono);
    font-size: 10px;
    letter-spacing: 0.2em;
    color: var(--color-muted-warm);
    text-transform: uppercase;
  }
  .epigraph .line {
    font-family: var(--font-italic);
    font-style: italic;
    font-size: clamp(20px, 2.6vw, 28px);
    line-height: 1.3;
    color: #3a3027;
  }
  .epigraph .line em { color: var(--color-crimson-deep); font-style: italic; }

  /* Entries section */
  .entries          { padding: clamp(20px, 3vw, 32px) var(--gutter) clamp(72px, 9vw, 112px); }
  .entries__inner   { max-width: 880px; margin: 0 auto; }

  .close {
    margin-top: 56px;
    padding: 22px 0 4px;
    border-top: 1px dashed var(--rule);
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 16px;
    font-family: var(--font-terminal);
    font-size: 11.5px;
    letter-spacing: 0.16em;
    color: var(--color-muted-warm);
    text-transform: lowercase;
    opacity: 0.85;
  }
  .close .mark { color: var(--color-crimson-deep); margin-right: 8px; }

  @media (max-width: 900px) {
    .head__inner { grid-template-columns: 1fr; gap: 36px; }
    .head__pol   { order: -1; justify-self: start; max-width: 280px; margin-top: 0; }
  }
  @media (max-width: 600px) {
    .head { padding-top: clamp(40px, 8vw, 64px); }
    .head__pol { max-width: 240px; }
    .epigraph { grid-template-columns: 1fr; gap: 8px; margin-top: 28px; padding-top: 18px; }
    .epigraph .mark { display: none; }
    .epigraph .line { font-size: 20px; }
    .close {
      flex-direction: column; align-items: flex-start;
      gap: 6px; font-size: 10.5px;
      margin-top: 40px; padding-top: 18px;
    }
  }
</style>
