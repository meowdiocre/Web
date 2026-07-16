<script>
  /** @type {{ seo: import('$lib/seo/post').ResolvedSeo }} */
  let { seo } = $props();

  const jsonLd = $derived(JSON.stringify(seo.jsonLd).replace(/</g, '\\u003c'));
</script>

<svelte:head>
  <title>{seo.documentTitle}</title>
  <meta name="description" content={seo.description} />
  {#if seo.author}<meta name="author" content={seo.author} />{/if}
  <meta name="robots" content={seo.robots} />
  <link rel="canonical" href={seo.canonical} />

  <meta property="og:locale" content="en_US" />
  <meta property="og:type" content={seo.type} />
  <meta property="og:site_name" content={seo.siteName} />
  <meta property="og:title" content={seo.title} />
  <meta property="og:description" content={seo.description} />
  <meta property="og:url" content={seo.canonical} />
  {#if seo.image}
    <meta property="og:image" content={seo.image} />
    <meta property="og:image:secure_url" content={seo.image} />
    <meta property="og:image:alt" content={seo.imageAlt ?? seo.title} />
  {/if}

  <meta name="twitter:card" content={seo.image ? 'summary_large_image' : 'summary'} />
  <meta name="twitter:title" content={seo.title} />
  <meta name="twitter:description" content={seo.description} />
  {#if seo.image}
    <meta name="twitter:image" content={seo.image} />
    <meta name="twitter:image:alt" content={seo.imageAlt ?? seo.title} />
  {/if}

  {#if seo.type === 'article'}
    {#if seo.author}<meta property="article:author" content={seo.author} />{/if}
    {#if seo.section}<meta property="article:section" content={seo.section} />{/if}
    {#if seo.publishedTime}
      <meta property="article:published_time" content={seo.publishedTime} />
    {/if}
    {#if seo.modifiedTime}<meta property="article:modified_time" content={seo.modifiedTime} />{/if}
  {/if}

  {@html `<script type="application/ld+json">${jsonLd}</script>`}
</svelte:head>
