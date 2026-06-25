<script>
  /**
   * ArticleHead — head block for /article: breadcrumb, kicker chip,
   * italic h1 with em emphasis, dek, and a mono meta row above the
   * essay body.
   *
   * @typedef {Object} TitleParts
   * @property {string} pre    leading words ('Devirtualizing ')
   * @property {string} em     italicised emphasis ('VMProtect 3.x')
   * @property {string} post   trailing words (' without a VM.')
   *
   * @typedef {Object} Meta
   * @property {string} author
   * @property {string} date
   * @property {string} readTime
   *
   * @typedef {Object} Props
   * @property {string}     category
   * @property {TitleParts} title
   * @property {string}     dek
   * @property {Meta}       meta
   */

  /** @type {Props} */
  let { category, title, dek, meta } = $props();
</script>

<section
  class="
    px-[var(--gutter)] pt-[clamp(40px,6vw,80px)] pb-[clamp(28px,4vw,48px)]
  "
  aria-labelledby="article-title"
>
  <div class="mx-auto max-w-[760px]">
    <p class="mb-[22px] font-mono text-[11px] tracking-[0.18em] uppercase text-muted">
      <a href="/"     class="hover:text-[var(--accent)]">Index</a>
      <span class="mx-2.5 text-muted">/</span>
      <a href="/blog" class="hover:text-[var(--accent)]">Writing</a>
    </p>

    <span class="kicker">{category}</span>

    <h1 id="article-title" class="title">
      {title.pre}<em>{title.em}</em>{title.post}
    </h1>

    <p
      class="
        mb-8 max-w-[56ch]
        font-serif text-[clamp(20px,2.2vw,24px)] leading-[1.45] text-[var(--fg-2)]
        max-[600px]:text-[18px]
      "
    >{dek}</p>

    <div class="meta">
      <span>By <b>{meta.author}</b></span>
      <span>{meta.date}</span>
      <span>{meta.readTime}</span>
    </div>
  </div>
</section>

<style>
  .kicker {
    display: inline-block;
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
    font-family: var(--font-italic);
    font-style: italic;
    font-weight: 400;
    font-size: clamp(40px, 6vw, 84px);
    line-height: 1.02;
    letter-spacing: -0.015em;
    color: var(--fg);
    margin-bottom: 24px;
  }
  .title em { color: var(--fg); font-style: italic; }

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
