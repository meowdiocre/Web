<script>
  import { SITE }     from '$lib/config/site.js';
  import { article } from '$lib/data/article.js';
  import { related } from '$lib/data/related.js';

  import Nav             from '$lib/components/Nav.svelte';
  import Footer          from '$lib/components/Footer.svelte';
  import SkipLink        from '$lib/components/SkipLink.svelte';
  import ReaderControls  from '$lib/components/ReaderControls.svelte';
  import ScrollProgress  from '$lib/components/article/ScrollProgress.svelte';
  import ArticleHead     from '$lib/components/article/ArticleHead.svelte';
  import Essay           from '$lib/components/article/Essay.svelte';
  import RelatedGrid     from '$lib/components/article/RelatedGrid.svelte';
</script>

<svelte:head>
  <title>{article.head.title.pre}{article.head.title.em}{article.head.title.post} — {SITE.brand}</title>
  <meta
    name="description"
    content="A field guide to recovering original IR from a VMProtect 3.x dispatch trace, without instrumenting the protected binary."
  />
</svelte:head>

<SkipLink target="#article-main" label="Skip to article" />

<ScrollProgress />

<Nav current="writing" />

<ReaderControls />

<main id="article-main">
  <ArticleHead {...article.head} />
  <Essay body={article.body} footnotes={article.footnotes} />
  <RelatedGrid items={related} />
</main>

<Footer variant="article" />
