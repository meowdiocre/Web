<script>
  import { SITE, NAV_WINDOWS, findWindowByKey } from '$lib/config/site.js';

  /**
   * Nav — sticky tmux status-line shared across every page.
   * The whole bar reads as a terminal multiplexer:
   *   [session] | windows... | crumb | toggle
   *
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
  <!-- Session badge — paper-on-ink tag + dark host suffix. -->
  <a
    class="
      session inline-flex items-center
      pl-[clamp(14px,2vw,28px)] max-[900px]:pl-[clamp(10px,3vw,14px)]
    "
    href="/"
    aria-label="{SITE.brand} home — session: {SITE.session}@{SITE.host}"
  >
    <span
      class="
        inline-flex items-center h-6 px-[9px]
        bg-rose text-ink tracking-[0.08em]
        max-[900px]:h-[26px] max-[460px]:text-[11.5px]
      "
    >
      <span class="text-crimson mr-1 font-display text-[14px] translate-y-[0.5px]">∅</span>{SITE.session}
    </span>
    <span
      class="
        host pl-2.5 pr-3 text-bone tracking-[0.06em]
        max-[900px]:pl-2.5 max-[900px]:pr-0 max-[900px]:opacity-70 max-[900px]:text-[11.5px]
        max-[600px]:pl-2 max-[600px]:text-[11px] max-[600px]:opacity-60
        max-[460px]:hidden
      "
    >
      <span class="at">@</span>dev<span class="at">:</span><span class="path">{meta.hostPath}</span>
    </span>
  </a>

  <span
    class="self-center text-muted opacity-50 select-none px-0.5 max-[900px]:hidden"
    aria-hidden="true"
  >│</span>

  <!-- Window list — desktop inline, mobile drawer. -->
  <nav
    class="
      windows inline-flex items-center gap-3 overflow-hidden
      px-[clamp(14px,1.6vw,22px)]
      max-[900px]:hidden
    "
    class:is-open={open}
    id="nav-drawer"
    aria-label="Primary"
  >
    {#each NAV_WINDOWS as w}
      <a
        href={w.path}
        aria-current={current === w.key ? 'page' : undefined}
        onclick={close}
      >
        <span class="idx">{w.idx}:</span>{w.name}<span class="mark-active">*</span><span class="mark-prev">-</span>
      </a>
    {/each}
  </nav>

  <!-- Mobile-only crumb showing the current page. -->
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

  <!-- Mobile toggle — `≡` closed, `×` open. -->
  <button
    class="
      toggle hidden items-center justify-center
      h-8 min-w-11 px-3
      my-auto mr-[clamp(8px,2vw,18px)]
      bg-transparent text-rose border border-rose/40
      font-terminal text-[18px] leading-none tracking-[0.1em]
      cursor-pointer relative z-[2]
      transition-[background,color,border-color] duration-150
      hover:bg-rose hover:text-ink hover:border-rose
      focus-visible:bg-rose focus-visible:text-ink focus-visible:border-rose
      max-[900px]:inline-flex max-[900px]:h-9 max-[900px]:bg-rose/[0.05] max-[900px]:border-rose/[0.48]
      max-[360px]:mr-1.5 max-[360px]:min-w-10 max-[360px]:px-[9px]
    "
    id="nav-toggle"
    type="button"
    aria-label={open ? 'Close menu' : 'Open menu'}
    aria-expanded={open}
    aria-controls="nav-drawer"
    onclick={toggle}
  >
    <span class="glyph inline-block" aria-hidden="true"></span>
  </button>
</header>

<style>
  /* Session sub-tints inside the host suffix span. */
  .session .at   { color: var(--color-muted); }
  .session .path { color: var(--color-rose); }

  /* ============================================================
   * Window list — desktop reverse-video for active link
   * ============================================================ */
  .windows a {
    display: inline-flex; align-items: baseline;
    height: 24px; padding: 0 7px;
    color: var(--color-bone);
    letter-spacing: 0.04em;
    line-height: 24px;
    transition: color 0.12s, background 0.12s;
    white-space: nowrap;
  }
  .windows a .idx         { color: var(--color-muted); margin-right: 5px; }
  .windows a .mark-prev   { color: var(--color-crimson); margin-left: 3px; opacity: 0; }
  .windows a .mark-active { color: var(--color-ink); margin-left: 3px; opacity: 0; font-weight: 700; }
  .windows a:hover                { color: var(--color-rose); background: rgb(232 156 146 / 0.08); }
  .windows a:hover .idx           { color: var(--color-rose); }
  .windows a[aria-current='page'] { background: var(--color-rose); color: var(--color-ink); }
  .windows a[aria-current='page'] .idx         { color: var(--color-ink); opacity: 0.55; }
  .windows a[aria-current='page'] .mark-active { opacity: 1; }

  /* Toggle glyph swap */
  .toggle[aria-expanded='true']  .glyph::before { content: '\00d7'; }
  .toggle[aria-expanded='false'] .glyph::before { content: '\2261'; }

  /* ============================================================
   * Mobile drawer — slim tmux command palette
   * ============================================================ */
  @media (max-width: 900px) {
    .windows.is-open {
      display: flex;
      position: absolute;
      inset: 100% 0 auto 0;
      flex-direction: column;
      gap: 0;
      padding: 6px 0 0;
      background: rgb(15 11 14 / 0.985);
      backdrop-filter: saturate(160%) blur(18px);
      border-top:    1px solid rgb(232 156 146 / 0.30);
      border-bottom: 1px solid rgb(232 156 146 / 0.18);
      box-shadow: 0 18px 36px rgb(0 0 0 / 0.6);
      z-index: 60;
    }
    .windows.is-open a {
      position: relative;
      display: flex; align-items: center; gap: 10px;
      height: 44px; min-height: 44px;
      padding: 0 18px; width: 100%;
      background: transparent;
      color: var(--color-bone);
      border-left: 3px solid transparent;
      letter-spacing: 0.04em;
      font-size: 14px;
      transition: background 0.12s, color 0.12s, border-left-color 0.12s;
    }
    .windows.is-open a::before {
      content: '$';
      color: var(--color-muted); opacity: 0.55;
      font-family: var(--font-terminal);
      flex-shrink: 0;
    }
    .windows.is-open a .idx,
    .windows.is-open a .mark-prev,
    .windows.is-open a .mark-active { display: none; }
    .windows.is-open a:hover,
    .windows.is-open a:focus-visible {
      background: rgb(232 156 146 / 0.06);
      color: var(--color-rose);
      border-left-color: var(--color-rose);
    }
    .windows.is-open a:hover::before,
    .windows.is-open a:focus-visible::before {
      color: var(--color-rose); opacity: 0.85;
    }
    .windows.is-open a[aria-current='page'] {
      background: rgb(232 156 146 / 0.09);
      color: var(--color-rose);
      border-left-color: var(--color-rose);
    }
    .windows.is-open a[aria-current='page']::before { color: var(--color-rose); opacity: 0.85; }
    .windows.is-open a[aria-current='page']::after {
      content: '*';
      color: var(--color-crimson);
      margin-left: auto;
      font-weight: 700;
      font-family: var(--font-terminal);
    }
    .windows.is-open::after {
      content: '~ $ _';
      display: block;
      padding: 8px 18px;
      color: var(--color-muted); opacity: 0.45;
      font-family: var(--font-terminal);
      font-size: 12px;
      letter-spacing: 0.08em;
      border-top: 1px dashed rgb(232 156 146 / 0.14);
      margin-top: 4px;
    }

    .toggle[aria-expanded='true'] {
      background: var(--color-rose);
      color: var(--color-ink);
      border-color: var(--color-rose);
    }
  }

  /* Slightly darker plum bg on the article page to match the chrome. */
  :global(body[data-page='article']) .nav {
    background: rgb(22 17 21 / 0.94);
    box-shadow: 0 1px 0 rgb(22 17 21 / 0.94), 0 2px 0 rgb(232 156 146 / 0.07);
  }

  /* Solid fallback for browsers without backdrop-filter. */
  @supports not ((backdrop-filter: blur(1px)) or (-webkit-backdrop-filter: blur(1px))) {
    .nav { background: rgb(10 9 8 / 0.985); }
    :global(body[data-page='article']) .nav { background: rgb(22 17 21 / 0.985); }
  }
</style>
