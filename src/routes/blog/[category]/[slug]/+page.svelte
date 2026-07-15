<script>
  import { SITE } from '$lib/config/site.js';

  import Nav from '$lib/components/Nav.svelte';
  import Footer from '$lib/components/Footer.svelte';
  import SkipLink from '$lib/components/SkipLink.svelte';
  import ReaderControls from '$lib/components/ReaderControls.svelte';
  import ScrollProgress from '$lib/components/article/ScrollProgress.svelte';
  import ArticleHead from '$lib/components/article/ArticleHead.svelte';
  import Essay from '$lib/components/article/Essay.svelte';
  import RelatedGrid from '$lib/components/article/RelatedGrid.svelte';
  import ArticlePageSkeleton from '$lib/components/loading/ArticlePageSkeleton.svelte';
  import { composeTitle } from '$lib/util/strings';

  /** @type {{ data: {
    article: Promise<import('$lib/server/db/queries').PublicArticle> | import('$lib/server/db/queries').PublicArticle,
    related: Promise<import('$lib/server/db/queries').RelatedEntry[]> | import('$lib/server/db/queries').RelatedEntry[]
  } }} */
  let { data } = $props();
</script>

<svelte:head>
  {#await data.article}
    <title>Article | {SITE.brand}</title>
  {:then article}
    <title>{composeTitle(article.head.title)} | {SITE.brand}</title>
    <meta name="description" content={article.head.dek} />
  {:catch}
    <title>Article unavailable | {SITE.brand}</title>
  {/await}
</svelte:head>

<SkipLink target="#article-main" label="Skip to article" />

<ScrollProgress />

<Nav current="writing" />

<ReaderControls />

<main id="article-main">
  {#await data.article}
    <ArticlePageSkeleton />
  {:then article}
    <ArticleHead {...article.head} />
    <Essay html={article.bodyHtml} footnotes={article.footnotes} />
    {#await data.related then related}
      {#if related.length}
        <RelatedGrid items={related} />
      {/if}
    {:catch}
      <section class="px-[var(--gutter)] py-12 border-t border-[var(--rule)] bg-[var(--bg-2)]">
        <p class="mx-auto max-w-[1280px] font-mono text-[11px] tracking-[0.16em] uppercase text-muted-warm">
          Related entries are unavailable.
        </p>
      </section>
    {/await}
  {:catch}
    <section class="px-[var(--gutter)] py-[clamp(56px,8vw,96px)]">
      <div class="mx-auto max-w-[820px]">
        <p class="font-mono text-[11px] tracking-[0.18em] uppercase text-muted-warm">Article unavailable</p>
        <h1 class="mt-3 font-display text-[clamp(32px,5vw,56px)] uppercase leading-[1.02]">
          The page could not be loaded.
        </h1>
      </div>
    </section>
  {/await}
</main>

<Footer variant="article" />
