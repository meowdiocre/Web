<script>
  /**
   * @typedef {Object} Props
   * @property {'primary'|'secondary'} [tone]
   * @property {'paper'|'ink'} [palette]
   * @property {import('svelte').Snippet} [children]
   */

  /** @type {Props} */
  let { tone = 'primary', palette = 'paper', children } = $props();

  const colour = $derived(
    palette === 'ink'
      ? (tone === 'primary' ? 'text-paper-ink-soft' : 'text-muted-warm')
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
