<script>
  /** @type {{ open: boolean, toggle: () => void }} */
  let { open, toggle } = $props();
</script>

<button
  class="
    toggle hidden items-center justify-center
    h-11 min-w-11 px-3
    my-auto mr-[clamp(8px,2vw,18px)]
    bg-transparent text-rose border border-rose/40
    font-terminal text-[18px] leading-none tracking-[0.1em]
    cursor-pointer relative z-[2]
    transition-[background,color,border-color] duration-150
    hover:bg-rose hover:text-ink hover:border-rose
    focus-visible:bg-rose focus-visible:text-ink focus-visible:border-rose
    aria-expanded:bg-rose aria-expanded:text-ink aria-expanded:border-rose
    max-[900px]:inline-flex max-[900px]:bg-rose/[0.05] max-[900px]:border-rose/[0.48]
    max-[360px]:mr-1.5 max-[360px]:px-[9px]
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

<style>
  .toggle[aria-expanded='true'] .glyph::before { content: '\00d7'; }
  .toggle[aria-expanded='false'] .glyph::before { content: '\2261'; }
</style>
