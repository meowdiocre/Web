<script>
  import { SITE }      from '$lib/config/site.js';
  import Nav           from '$lib/components/Nav.svelte';
  import SeoHead       from '$lib/components/SeoHead.svelte';
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
  import { resolvePageSeo } from '$lib/seo/post';

  /** @type {{ data: { entryGroups: Promise<import('$lib/server/db/queries').EntryGroup[]> | import('$lib/server/db/queries').EntryGroup[] } }} */
  let { data } = $props();
  let searchQuery = $state($page.url.searchParams.get('q') ?? '');
  let categoryFilter = $state($page.url.searchParams.get('category') ?? 'all');
  const seo = resolvePageSeo({
    siteUrl: SITE.url,
    path: '/blog',
    siteName: SITE.brand,
    title: 'Writing',
    description: 'Long-form essays and lab notes on Windows internals, anti-cheat, browser sandboxes, and large model behavior.',
    imageUrl: '/rei.jpg',
    imageAlt: `${SITE.brand} writing archive`
  });
</script>

<SeoHead {seo} />

<SkipLink target="#journal-title" />

<Nav current="writing" />

<main class="layer relative z-[1]">
  {#await data.entryGroups}
    <BlogPageSkeleton />
  {:then entryGroups}
    <section
      class="px-[var(--gutter)] pt-[clamp(56px,9vw,112px)] pb-[clamp(28px,4vw,48px)] max-[600px]:pt-[clamp(40px,8vw,64px)]"
      aria-labelledby="journal-title"
    >
      <div
        class="mx-auto grid max-w-[880px] grid-cols-[minmax(0,1.45fr)_minmax(0,0.95fr)] items-start gap-[clamp(28px,4.5vw,64px)] max-[900px]:grid-cols-1 max-[900px]:gap-9"
      >
        <div class="head__title min-w-0" use:reveal={{ y: 18 }}>
          <h1
            id="journal-title"
            class="mb-[clamp(18px,2vw,26px)] flex min-w-0 items-baseline font-display text-[clamp(48px,8vw,112px)] leading-[0.92] tracking-[-0.035em] lowercase text-paper-ink [overflow-wrap:anywhere]"
          >
            <span>writing<span class="text-crimson-deep">.</span></span>
          </h1>
          <Lede palette="ink">
            Long-form essays and lab notes on reverse engineering, OS internals, anti-cheat infrastructure, web exploitation, and breaking the capitalist tech giants.
          </Lede>
        </div>

        <div
          class="mt-1 w-full max-w-[360px] justify-self-end self-start max-[900px]:order-first max-[900px]:mt-0 max-[900px]:max-w-[280px] max-[900px]:justify-self-start max-[600px]:max-w-[240px]"
          use:reveal={{ y: 18, delay: 0.08 }}
        >
          <Polaroid src="/rei.jpg" alt="" prompt=">" caption="page_fault" rotate={-2.4} />
        </div>

        <aside
          class="col-span-full mt-[clamp(28px,3.6vw,44px)] grid max-w-[58ch] grid-cols-[20px_1fr] items-baseline gap-3 border-t border-crimson-deep pt-4 max-[600px]:mt-6 max-[600px]:grid-cols-[16px_1fr] max-[600px]:gap-2.5 max-[600px]:pt-3"
          role="note"
          aria-label="Epigraph"
          use:reveal={{ y: 14, delay: 0.16 }}
        >
          <span
            class="inline-flex translate-y-[0.06em] items-center self-start text-crimson-deep opacity-80"
            aria-hidden="true"
          ><PixelIcon name="script" size="clamp(12px, 3vw, 14px)" /></span>
          <p
            class="font-italic text-[clamp(19px,2.4vw,26px)] leading-[1.32] italic text-paper-ink-soft text-pretty max-[600px]:text-[19px]"
          >Learn the rules like an expert, <em class="italic text-crimson-deep">so you can break them like an artist.</em></p>
        </aside>
      </div>
    </section>

    <BlogIndexView
      {entryGroups}
      bind:query={searchQuery}
      bind:selectedCategory={categoryFilter}
    />
  {:catch}
    <section
      class="px-[var(--gutter)] pt-[clamp(56px,9vw,112px)] pb-[clamp(28px,4vw,48px)] max-[600px]:pt-[clamp(40px,8vw,64px)]"
      aria-labelledby="journal-title"
    >
      <div
        class="mx-auto grid max-w-[880px] grid-cols-[minmax(0,1.45fr)_minmax(0,0.95fr)] items-start gap-[clamp(28px,4.5vw,64px)] max-[900px]:grid-cols-1 max-[900px]:gap-9"
      >
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
