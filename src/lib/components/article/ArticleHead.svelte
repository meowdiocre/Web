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
   * @property {string} readTime
   *
   * @typedef {Object} Props
   * @property {string} category
   * @property {TitleParts} title
   * @property {string} dek
   * @property {Meta} meta
   */

  import { reveal } from '$lib/motion/reveal';
  import PixelIcon from '$lib/components/PixelIcon.svelte';
  import { categoryIcon } from '$lib/config/category-icons.js';

  /** @type {Props} */
  let { category, title, dek, meta } = $props();

  const iconName = $derived(categoryIcon(category));
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

    <span class="kicker" use:reveal={{ y: 10, delay: 0.06 }}>
      <PixelIcon name={iconName} size={10} />
      {category}
    </span>

    <h1 id="article-title" class="title" use:reveal={{ y: 16, delay: 0.12 }}>
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

    <div class="meta" use:reveal={{ y: 12, delay: 0.24 }}>
      <span>By <b>{meta.author}</b></span>
      <span>{meta.date}</span>
      <span>{meta.readTime}</span>
    </div>
  </div>
</section>

<style>
  .kicker {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    margin-bottom: 18px;
    padding: 5px 11px;
    background: transparent;
    color: var(--fg);
    border: 1px solid var(--rule);
    font-family: var(--font-display);
    font-size: 10px;
    letter-spacing: 0.22em;
    text-transform: uppercase;
    transform: rotate(-1deg);
    clip-path: polygon(6% 0, 100% 0, 96% 100%, 0 100%);
  }

  .title {
    font-family: var(--font-display);
    font-weight: 400;
    font-size: clamp(36px, 5.2vw, 72px);
    line-height: 1.04;
    letter-spacing: -0.02em;
    text-transform: uppercase;
    color: var(--fg);
    margin-bottom: 24px;
    overflow-wrap: anywhere;
    min-width: 0;
  }
  .title em {
    font-style: normal;
    color: var(--accent);
  }

  @media (max-width: 600px) { .title { font-size: clamp(34px, 9.5vw, 58px); line-height: 1.04; } }
  @media (max-width: 360px) { .title { font-size: clamp(28px, 9vw, 40px); } }

  .meta {
    display: flex;
    flex-wrap: wrap;
    gap: 12px 28px;
    padding: 18px 0;
    border-block: 1px solid var(--rule);
    font-family: var(--font-mono);
    font-size: 12px;
    letter-spacing: 0.08em;
    color: var(--color-muted);
    text-transform: uppercase;
  }
  .meta b { color: var(--fg); font-weight: 500; }
  @media (max-width: 360px) { .meta { font-size: 11px; gap: 8px 18px; } }
</style>
