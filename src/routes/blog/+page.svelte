<script>
  import { SITE }      from '$lib/config/site.js';
  import Nav           from '$lib/components/Nav.svelte';
  import Footer        from '$lib/components/Footer.svelte';
  import SkipLink      from '$lib/components/SkipLink.svelte';
  import PageKicker    from '$lib/components/PageKicker.svelte';
  import PageTitle     from '$lib/components/PageTitle.svelte';
  import Lede          from '$lib/components/Lede.svelte';
  import Polaroid      from '$lib/components/Polaroid.svelte';
  import BlogIndexView from '$lib/components/blog/BlogIndexView.svelte';
  import BlogPageSkeleton from '$lib/components/loading/BlogPageSkeleton.svelte';
  import { SIGNAL_GLYPH } from '$lib/config/motif.js';
  import { page } from '$app/stores';

  /** @type {{ data: { entryGroups: Promise<import('$lib/server/db/queries').EntryGroup[]> | import('$lib/server/db/queries').EntryGroup[] } }} */
  let { data } = $props();
  let searchQuery = $state($page.url.searchParams.get('q') ?? '');
  let categoryFilter = $state($page.url.searchParams.get('category') ?? 'all');
</script>

<svelte:head>
  <title>Writing | {SITE.brand}</title>
  <meta
    name="description"
    content="Long-form essays and lab notes on Windows internals, anti-cheat, browser sandboxes, and large model behavior."
  />
</svelte:head>

<SkipLink target="#journal-title" />

<Nav current="writing" />

<main class="layer">
  {#await data.entryGroups}
    <BlogPageSkeleton />
  {:then entryGroups}
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
          <span class="mark" aria-hidden="true">{SIGNAL_GLYPH}</span>
          <p class="line">Learn the rules like an expert. <em>so you can break them like an artist
.</em></p>
        </aside>
      </div>
    </section>

    <BlogIndexView
      {entryGroups}
      bind:query={searchQuery}
      bind:selectedCategory={categoryFilter}
    />
  {:catch}
    <section class="head" aria-labelledby="journal-title">
      <div class="head__inner">
        <div class="min-w-0">
          <PageKicker label="Archive unavailable" tone="muted-warm" />
          <PageTitle text="writing" id="journal-title" tone="ink" dotTone="crimson-deep" />
          <Lede palette="ink">
            The archive could not be loaded. Try again in a moment.
          </Lede>
        </div>
      </div>
    </section>
  {/await}
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
  }
</style>
