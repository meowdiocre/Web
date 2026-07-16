<script>
  import PixelIcon from '$lib/components/PixelIcon.svelte';

  /**
   * @typedef {Object} Props
   * @property {string} href
   * @property {import('svelte').Snippet} children
   */

  /** @type {Props} */
  let { href, children } = $props();
</script>

<a class="group inline-flex min-h-11 items-center gap-2 whitespace-nowrap px-0.5 py-1.5 font-terminal text-[13px] tracking-label text-muted lowercase transition-[color,transform] duration-150 hover:-translate-x-0.5 hover:text-bone active:translate-x-0 active:text-rose focus-visible:outline focus-visible:outline-dashed focus-visible:outline-paper focus-visible:outline-offset-4" {href}>
  <span class="text-rose opacity-70 transition-[color,opacity] duration-150 group-hover:text-crimson group-hover:opacity-100" aria-hidden="true"><PixelIcon name="arrow-right" size={14} /></span>
  {@render children()}
</a>
