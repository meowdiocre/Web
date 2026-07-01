<script>
  /**
   * Lede is the large serif intro paragraph used on /blog and /about.
   *
   * @typedef {Object} Props
   * @property {'primary'|'secondary'} [tone]      primary = on-page text, secondary = muted continuation
   * @property {'paper'|'ink'}         [palette]   page palette (paper = dark page, ink = cream page)
   * @property {import('svelte').Snippet} [children]
   */

  /** @type {Props} */
  let { tone = 'primary', palette = 'paper', children } = $props();

  /** Resolve text colour against the page palette. */
  const colour = $derived(
    palette === 'ink'
      ? (tone === 'primary' ? 'text-[#3a3027]' : 'text-muted-warm')
      : (tone === 'primary' ? 'text-bone'      : 'text-muted')
  );
  const margin = $derived(tone === 'primary' ? 'mt-[26px]' : 'mt-3.5');
</script>

<p
  class="
    max-w-[58ch] font-serif leading-[1.6]
    text-[clamp(17px,1.6vw,19px)]
    {colour} {margin}
    max-[600px]:text-[16px] max-[360px]:text-[15px]
  "
>{@render children?.()}</p>
