<script>
  import { findWindowByKey } from '$lib/config/site.js';
  import MobileAppNav from '$lib/components/nav/MobileAppNav.svelte';
  import NavSession from '$lib/components/nav/NavSession.svelte';
  import NavWindowLinks from '$lib/components/nav/NavWindowLinks.svelte';

  /**
   * @typedef {'home'|'writing'|'about'} Current
   * @typedef {{ current: Current }} Props
   */

  /** @type {Props} */
  let { current } = $props();

  const meta = $derived(findWindowByKey(current));

</script>

<MobileAppNav {current} />

<header
  class="
    nav sticky top-0 z-50 hidden
    min-[901px]:grid grid-cols-[auto_auto_1fr] items-stretch
    h-11
    bg-nav-overlay backdrop-blur-md backdrop-saturate-150
    border-b border-dashed border-rose/[0.24]
    shadow-nav
    font-terminal text-[13px] leading-none tracking-[0.02em] text-bone
    [overflow-x:clip] overflow-y-visible
  "
>
  <NavSession {meta} />

  <span
    class="self-center text-muted opacity-50 select-none px-0.5 max-[900px]:hidden"
    aria-hidden="true"
  >│</span>

  <nav
    class="
      windows inline-flex items-center gap-3 overflow-hidden
      px-[clamp(14px,1.6vw,22px)]
      max-[900px]:hidden
    "
    aria-label="Primary"
  >
    <NavWindowLinks {current} />
  </nav>

</header>

<style>
  :global(body[data-page='article']) .nav {
    background: var(--color-article-nav);
    box-shadow: var(--shadow-article-nav);
  }

  @supports not ((backdrop-filter: blur(1px)) or (-webkit-backdrop-filter: blur(1px))) {
    .nav { background: var(--color-overlay-strong); }
    :global(body[data-page='article']) .nav { background: var(--color-article-nav-strong); }
  }
</style>
