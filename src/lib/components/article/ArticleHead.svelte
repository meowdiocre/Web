<script>
  /**
   * @typedef {Object} TitleParts
   * @property {string} pre
   * @property {string} em
   * @property {string} post
   *
   * @typedef {Object} Meta
   * @property {string} author
   * @property {string} date
   *
   * @typedef {Object} Props
   * @property {string} category
   * @property {import('$lib/icons/icon-names').CategoryIconName} categoryIcon
   * @property {string|null} coverImageUrl
   * @property {TitleParts} title
   * @property {string} dek
   * @property {Meta} meta
   */

  import { reveal } from '$lib/motion/reveal';
  import PixelIcon from '$lib/components/PixelIcon.svelte';
  import PostThumbnail from '$lib/components/PostThumbnail.svelte';

  /** @type {Props} */
  let { category, categoryIcon, coverImageUrl, title, dek, meta } = $props();
</script>

<section
  class="
    px-[var(--gutter)] pt-[clamp(40px,6vw,80px)] pb-[clamp(28px,4vw,48px)]
  "
  aria-labelledby="article-title"
>
  <div class="mx-auto max-w-[760px]">
    <p class="mb-[22px] font-mono text-[11px] tracking-[0.18em] uppercase text-muted" use:reveal={{ y: 10 }}>
      <a href="/"     class="hover:text-[var(--accent)]">Index</a>
      <span class="mx-2.5 text-muted">/</span>
      <a href="/blog" class="hover:text-[var(--accent)]">Writing</a>
    </p>

    <span class="mb-[18px] inline-flex -rotate-1 items-center gap-1.5 border border-[var(--rule)] bg-transparent px-[11px] py-[5px] font-display text-2xs tracking-[0.22em] text-[var(--fg)] uppercase [clip-path:polygon(6%_0,100%_0,96%_100%,0_100%)]" use:reveal={{ y: 10, delay: 0.06 }}>
      <PixelIcon name={categoryIcon} size={10} />
      {category}
    </span>

    <h1 id="article-title" class="mb-6 min-w-0 font-display text-[clamp(36px,5.2vw,72px)] leading-[1.04] font-normal tracking-[-0.02em] text-[var(--fg)] uppercase [overflow-wrap:anywhere] [&_em]:text-[var(--accent)] [&_em]:not-italic max-[600px]:text-[clamp(34px,9.5vw,58px)] max-[360px]:text-[clamp(28px,9vw,40px)]" use:reveal={{ y: 16, delay: 0.12 }}>
      {title.pre}<em>{title.em}</em>{title.post}
    </h1>

    <p
      class="
        mb-8 max-w-[56ch]
        font-serif text-[clamp(20px,2.2vw,24px)] leading-[1.45] text-[var(--fg-2)]
        max-[600px]:text-[18px]
      "
      use:reveal={{ y: 14, delay: 0.18 }}
    >{dek}</p>

    {#if coverImageUrl}
      <PostThumbnail src={coverImageUrl} variant="hero" />
    {/if}

    <div class="flex flex-wrap gap-x-7 gap-y-3 border-y border-[var(--rule)] py-[18px] font-mono text-xs tracking-label text-muted uppercase [&_b]:font-medium [&_b]:text-[var(--fg)] max-[360px]:gap-x-[18px] max-[360px]:gap-y-2 max-[360px]:text-xs-plus" use:reveal={{ y: 12, delay: 0.24 }}>
      <span>By <b>{meta.author}</b></span>
      <span>{meta.date}</span>
    </div>
  </div>
</section>
