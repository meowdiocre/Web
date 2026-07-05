<script>
  import { SITE } from '$lib/config/site.js';

  /**
   * @typedef {'minimal'|'paper'|'article'} Variant
   * @typedef {{ variant?: Variant }} Props
   */

  /** @type {Props} */
  let { variant = 'minimal' } = $props();

  const copyright = `© ${SITE.copyrightYear} ${SITE.brand}`;
</script>

{#if variant === 'minimal'}
  <footer
    class="
      layer
      px-[var(--gutter)] py-[22px]
      border-t border-[var(--line)]
      font-terminal text-[12px] tracking-[0.10em] lowercase text-muted
      max-[760px]:text-[10px]
    "
  >
    <div
      class="
        flex justify-between items-center gap-[18px] flex-wrap
        max-[760px]:flex-col max-[760px]:items-start max-[760px]:gap-3
      "
    >
      <span>{copyright} · Berlin</span>
      <nav aria-label="Footer" class="inline-flex gap-[clamp(14px,2vw,28px)] flex-wrap">
        <a class="link" href="/blog">Writing</a>
        <a class="link" href="/about">About</a>
      </nav>
    </div>
  </footer>

{:else if variant === 'paper'}
  <footer
    class="
      px-[var(--gutter)] pt-9 pb-[30px]
      bg-ink text-bone border-t-2 border-ink
      font-mono text-[11px] tracking-[0.14em] uppercase
    "
  >
    <div class="max-w-[880px] mx-auto flex justify-between gap-[18px] flex-wrap text-muted">
      <span>{copyright} · hand-set in Berlin</span>
      <span>
        <a class="link" href="/feed.xml" type="application/rss+xml" rel="alternate">RSS</a>
        <span class="mx-1.5 text-muted opacity-50">·</span>
        <a class="link" href="#top" aria-label="Back to top">↑ top</a>
      </span>
    </div>
  </footer>

{:else}
  <footer
    class="
      px-[var(--gutter)] py-9
      bg-ink text-bone
      font-mono text-[11px] tracking-[0.12em] uppercase
    "
  >
    <div class="max-w-[1280px] mx-auto flex justify-between gap-[18px] flex-wrap text-muted">
      <span>{copyright} · Berlin</span>
      <span><a class="link" href="/blog">↑ Back to writing</a></span>
    </div>
  </footer>
{/if}

<style>
  .link          { color: var(--color-bone); transition: color 0.15s; }
  .link:hover    { color: var(--color-crimson); }
</style>
