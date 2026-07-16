<script>
  /**
   * @typedef {Object} Props
   * @property {string} href
   * @property {import('svelte').Snippet} children
   */

  /** @type {Props} */
  let { href, children } = $props();
</script>

<a
  class="group inline-flex min-h-11 items-baseline gap-2 whitespace-nowrap bg-paper px-4 pt-[11px] pb-2.5 font-terminal text-sm tracking-[0.1em] text-ink lowercase shadow-hard [clip-path:polygon(0_0,100%_0,100%_70%,94%_100%,0_100%)] transition-[transform,background,color,box-shadow] duration-150 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:bg-crimson hover:text-paper hover:shadow-hard-lg active:translate-0 active:shadow-hard-xs focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-ink"
  {href}
>
  <span class="text-ink opacity-55 group-hover:text-paper group-hover:opacity-70">[</span>{@render children()}<span class="text-ink opacity-55 group-hover:text-paper group-hover:opacity-70">]</span>
</a>
