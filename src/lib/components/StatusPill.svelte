<script>
  /**
   * @typedef {Object} Props
   * @property {'draft'|'published'|string} value
   * @property {string} [className]
   */

  /** @type {Props} */
  let { value, className = '' } = $props();
</script>

<span
  class="inline-block border border-current px-2 py-0.5 font-mono text-[10px] tracking-[0.05em]
         {value === 'draft' ? 'text-muted' : value === 'published' ? 'text-rose' : ''}
         {className}"
>{value}</span>
