<script>
  /**
   * @typedef {Object} Props
   * @property {'draft'|'published'|string} value
   * @property {string} [className]
   */

  /** @type {Props} */
  let { value, className = '' } = $props();
</script>

<span class="status status--{value} {className}">{value}</span>
