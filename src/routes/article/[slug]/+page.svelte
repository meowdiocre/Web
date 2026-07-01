<script>
  import { SITE } from '$lib/config/site.js';

  import Nav             from '$lib/components/Nav.svelte';
  import Footer          from '$lib/components/Footer.svelte';
  import SkipLink        from '$lib/components/SkipLink.svelte';
  import ReaderControls  from '$lib/components/ReaderControls.svelte';
  import ScrollProgress  from '$lib/components/article/ScrollProgress.svelte';
  import ArticleHead     from '$lib/components/article/ArticleHead.svelte';
  import Essay           from '$lib/components/article/Essay.svelte';
  import RelatedGrid     from '$lib/components/article/RelatedGrid.svelte';
  import ArticlePageSkeleton from '$lib/components/loading/ArticlePageSkeleton.svelte';

  /** @type {{ data: {
    article: Promise<import('$lib/server/db/queries').PublicArticle> | import('$lib/server/db/queries').PublicArticle,
    related: Promise<any[]> | any[]
  } }} */
  let { data } = $props();
</script>

<svelte:head>
  {#await data.article}
    <title>Article | {SITE.brand}</title>
  {:then article}
    <title>{article.head.title.pre}{article.head.title.em}{article.head.title.post} | {SITE.brand}</title>
    <meta name="description" content={article.head.dek} />
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
    {/await}
  {/await}
</main>

<Footer variant="article" />
