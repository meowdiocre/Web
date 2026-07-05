<script>
  import { findWindowByKey } from '$lib/config/site.js';
  import NavSession from '$lib/components/nav/NavSession.svelte';
  import NavWindowLinks from '$lib/components/nav/NavWindowLinks.svelte';
  import NavToggle from '$lib/components/nav/NavToggle.svelte';

  /**
   * @typedef {'home'|'writing'|'about'} Current
   * @typedef {{ current: Current }} Props
   */

  /** @type {Props} */
  let { current } = $props();

  const meta = $derived(findWindowByKey(current));

  let open = $state(false);

  const toggle = () => { open = !open; };
  const close  = () => { open = false; };

  /** @param {KeyboardEvent} e */
  function onKey(e) {
    if (e.key === 'Escape' && open) {
      close();
      document.getElementById('nav-toggle')?.focus();
    }
  }
</script>

<svelte:window onkeydown={onKey} />

<header
  class="
    nav sticky top-0 z-50
    grid grid-cols-[auto_auto_1fr_auto] items-stretch
    h-11
    bg-[rgba(10,9,8,0.92)] backdrop-blur-md backdrop-saturate-150
    border-b border-dashed border-rose/[0.24]
    [box-shadow:0_1px_0_rgba(10,9,8,0.92),0_2px_0_rgba(232,156,146,0.07)]
    font-terminal text-[13px] leading-none tracking-[0.02em] text-bone
    [overflow-x:clip] overflow-y-visible
    max-[900px]:grid-cols-[auto_1fr_auto] max-[900px]:h-[46px]
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

  <span
    class="
      crumb hidden items-center justify-self-start whitespace-nowrap
      pl-[clamp(10px,2.6vw,18px)]
      font-terminal text-[13px] leading-none tracking-[0.06em]
      text-rose opacity-[0.78]
      max-[900px]:inline-flex max-[900px]:self-center max-[900px]:justify-self-end
      max-[900px]:h-[22px] max-[900px]:px-[9px] max-[900px]:mr-2.5
      max-[900px]:bg-rose/10 max-[900px]:border max-[900px]:border-rose/[0.32]
      max-[900px]:text-[11.5px] max-[900px]:tracking-[0.10em] max-[900px]:lowercase
      max-[460px]:text-[11px] max-[460px]:px-2
      max-[360px]:mr-1.5 max-[360px]:px-[7px] max-[360px]:tracking-[0.06em]
    "
    aria-hidden="true"
  >{meta.crumb}</span>

  <NavToggle {open} {toggle} />

  {#if open}
    <nav
      id="nav-drawer"
      class="
        hidden max-[900px]:flex
        absolute inset-x-0 top-full
        flex-col gap-0 pt-[6px]
        bg-[rgb(15_11_14_/_0.985)]
        backdrop-saturate-150 backdrop-blur-[18px]
        border-t border-b
        border-t-rose/[0.30] border-b-rose/[0.18]
        [box-shadow:0_18px_36px_rgb(0_0_0_/_0.6)]
        z-[60]
      "
      aria-label="Primary"
    >
      <NavWindowLinks {current} mobile close={close} />
      <div
        class="
          px-[18px] py-2 mt-1
          text-[12px] tracking-[0.08em] text-muted opacity-45
          border-t border-dashed border-rose/[0.14]
        "
        aria-hidden="true"
      >~ $ _</div>
    </nav>
  {/if}
</header>

<style>
  :global(body[data-page='article']) .nav {
    background: rgb(22 17 21 / 0.94);
    box-shadow: 0 1px 0 rgb(22 17 21 / 0.94), 0 2px 0 rgb(232 156 146 / 0.07);
  }

  @supports not ((backdrop-filter: blur(1px)) or (-webkit-backdrop-filter: blur(1px))) {
    .nav { background: rgb(10 9 8 / 0.985); }
    :global(body[data-page='article']) .nav { background: rgb(22 17 21 / 0.985); }
  }
</style>
