<script>
  import PixelIcon from '$lib/components/PixelIcon.svelte';
  import MobileSocialMenu from './MobileSocialMenu.svelte';
  import { BRAND_GLYPH } from '$lib/config/motif.js';
  import { SITE, findWindowByKey } from '$lib/config/site.js';

  /** @typedef {'home'|'writing'|'about'} Current */

  /** @type {{ current: Current }} */
  let { current } = $props();

  const meta = $derived(findWindowByKey(current));
  let open = $state(false);

  /** @type {Array<{ key: Current, href: string, label: string, icon: import('$lib/icons/icon-names').IconName }>} */
  const links = [
    { key: 'home', href: '/', label: 'Home', icon: 'home' },
    { key: 'writing', href: '/blog', label: 'Writing', icon: 'article' },
    { key: 'about', href: '/about', label: 'About', icon: 'user' }
  ];

  const close = () => { open = false; };

  /** @param {KeyboardEvent} event */
  function onKey(event) {
    if (event.key === 'Escape' && open) {
      close();
      document.getElementById('mobile-nav-menu')?.focus();
    }
  }
</script>

<svelte:window onkeydown={onKey} />

<div class="hidden max-[900px]:block" data-testid="mobile-app-shell">
  <header
    class="sticky top-0 z-50 flex min-h-14 items-center justify-between border-b border-rose/[0.18]
           bg-overlay-strong pt-[env(safe-area-inset-top)]
           pl-[max(12px,env(safe-area-inset-left))] pr-[max(12px,env(safe-area-inset-right))]
           font-terminal text-bone shadow-nav backdrop-blur-md backdrop-saturate-150"
    data-testid="mobile-app-bar"
  >
    <a
      href="/"
      aria-label={`${SITE.brand} home`}
      class="inline-flex min-h-11 items-center gap-2.5 no-underline"
      data-sveltekit-preload-data="tap"
      data-sveltekit-preload-code="hover"
    >
      <span class="grid size-8 place-items-center bg-rose font-display text-sm text-crimson" aria-hidden="true">
        {BRAND_GLYPH}
      </span>
      <span class="font-mono text-[11px] tracking-[0.05em] text-paper">{SITE.brand}</span>
    </a>

    <span class="inline-flex h-8 items-center gap-1.5 border border-rose/[0.28] bg-accent-wash px-2.5
                 font-mono text-[11px] tracking-[0.05em] text-rose lowercase">
      <span class="text-muted" aria-hidden="true">~/</span>{meta.crumb}
    </span>
  </header>

  {#if open}
    <button
      type="button"
      class="fixed inset-0 z-40 bg-black/45"
      aria-label="Close menu"
      onclick={close}
    ></button>
    <MobileSocialMenu {close} />
  {/if}

  <nav
    aria-label="Mobile primary"
    class="fixed inset-x-0 bottom-0 z-[60] grid grid-cols-4 border-t border-rose/[0.22] bg-overlay-strong
           pt-1.5 pb-[max(6px,env(safe-area-inset-bottom))]
           pl-[max(4px,env(safe-area-inset-left))] pr-[max(4px,env(safe-area-inset-right))]
           font-mono backdrop-blur-[18px] backdrop-saturate-150"
  >
    {#each links as link (link.key)}
      {@const active = current === link.key}
      <a
        href={link.href}
        aria-label={link.label}
        aria-current={active ? 'page' : undefined}
        onclick={close}
        data-sveltekit-preload-data="tap"
        data-sveltekit-preload-code="hover"
        class="relative flex min-h-14 min-w-11 flex-col items-center justify-center gap-1 px-1 no-underline
               transition-[color,background-color] duration-150 active:bg-accent-wash-strong motion-reduce:duration-0
               {active ? 'bg-accent-wash text-rose' : 'text-muted'}"
      >
        {#if active}
          <span class="absolute inset-x-3 top-0 h-0.5 bg-rose" aria-hidden="true"></span>
        {/if}
        <PixelIcon name={link.icon} size={20} />
        <span class="text-[10px] leading-none">{link.label}</span>
      </a>
    {/each}

    <button
      id="mobile-nav-menu"
      type="button"
      aria-label={open ? 'Close menu' : 'Open menu'}
      aria-expanded={open}
      aria-controls="mobile-menu"
      onclick={() => { open = !open; }}
      class="relative flex min-h-14 min-w-11 flex-col items-center justify-center gap-1 px-1
             transition-[color,background-color] duration-150 active:bg-accent-wash-strong motion-reduce:duration-0
             {open ? 'bg-accent-wash text-rose' : 'text-muted'}"
    >
      {#if open}
        <span class="absolute inset-x-3 top-0 h-0.5 bg-rose" aria-hidden="true"></span>
      {/if}
      <PixelIcon name={open ? 'close' : 'menu'} size={20} />
      <span class="text-[10px] leading-none">Menu</span>
    </button>
  </nav>
</div>
