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

  /** @type {{ data: { article: import('$lib/server/db/queries').PublicArticle, related: any[] } }} */
  let { data } = $props();
  const article = $derived(data.article);
  const related = $derived(data.related ?? []);
</script>

<svelte:head>
  <title>{article.head.title.pre}{article.head.title.em}{article.head.title.post} — {SITE.brand}</title>
  <meta name="description" content={article.head.dek} />
</svelte:head>

<SkipLink target="#article-main" label="Skip to article" />

<ScrollProgress />

<Nav current="writing" />

<ReaderControls />

<main id="article-main">
  <ArticleHead {...article.head} />
  <Essay html={article.bodyHtml} footnotes={article.footnotes} />
  {#if related.length}
    <RelatedGrid items={related} />
  {/if}
</main>

<Footer variant="article" />
