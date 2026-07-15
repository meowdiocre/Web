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
  import PixelIcon     from '$lib/components/PixelIcon.svelte';
  import { reveal } from '$lib/motion/reveal';
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
        <div class="head__title min-w-0" use:reveal={{ y: 18 }}>
          <h1 id="journal-title" class="head__title-row">
            <span class="head__title-inner">writing<span class="dot">.</span></span>
          </h1>
          <Lede palette="ink">
            Long-form essays and lab notes on reverse engineering, OS internals, anti-cheat infrastructure, web exploitation, and breaking the capitalist tech giants.
          </Lede>
        </div>

        <div class="head__pol" use:reveal={{ y: 18, delay: 0.08 }}>
          <Polaroid src="/rei.jpg" alt="" prompt=">" caption="page_fault" rotate={-2.4} />
        </div>

        <aside class="epigraph" role="note" aria-label="Epigraph" use:reveal={{ y: 14, delay: 0.16 }}>
          <span class="pilcrow" aria-hidden="true"><PixelIcon name="script" size={14} /></span>
          <p class="line">Learn the rules like an expert, <em>so you can break them like an artist.</em></p>
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
  .head__title-row {
    display: flex;
    align-items: baseline;
    margin: 0 0 clamp(18px, 2vw, 26px);
    font-family: var(--font-display);
    font-size: clamp(48px, 8vw, 112px);
    line-height: 0.92;
    letter-spacing: -0.035em;
    color: #2a1c14;
    text-transform: lowercase;
    overflow-wrap: anywhere;
    min-width: 0;
  }
  .head__title-row .dot {
    color: var(--color-crimson-deep);
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
    margin-top: clamp(28px, 3.6vw, 44px);
    padding: 4px 0 4px clamp(16px, 1.8vw, 22px);
    border-left: 2px solid var(--color-crimson-deep);
    display: grid;
    grid-template-columns: 20px 1fr;
    gap: 12px;
    align-items: baseline;
    max-width: 58ch;
  }
  .epigraph .pilcrow {
    display: inline-flex;
    align-items: center;
    color: var(--color-crimson-deep);
    opacity: 0.8;
    align-self: start;
    transform: translateY(0.06em);
  }
  .epigraph .line {
    font-family: var(--font-italic);
    font-style: italic;
    font-size: clamp(19px, 2.4vw, 26px);
    line-height: 1.32;
    color: #3a3027;
    text-wrap: pretty;
  }
  .epigraph .line em { color: var(--color-crimson-deep); font-style: italic; }
  @media (max-width: 900px) {
    .head__inner { grid-template-columns: 1fr; gap: 36px; }
    .head__pol   { order: -1; justify-self: start; max-width: 280px; margin-top: 0; }
  }
  @media (max-width: 600px) {
    .head { padding-top: clamp(40px, 8vw, 64px); }
    .head__pol { max-width: 240px; }
    .epigraph {
      grid-template-columns: 16px 1fr;
      gap: 10px;
      margin-top: 24px;
      padding-left: 12px;
    }
    .epigraph .pilcrow :global(.pixel-icon) { width: 12px; height: 12px; }
    .epigraph .line { font-size: 19px; }
  }
</style>
