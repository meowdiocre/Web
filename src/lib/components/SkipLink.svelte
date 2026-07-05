<script>
  /**
   * @typedef {Object} Props
   * @property {string} target
   * @property {string} [label]
   */

  /** @type {Props} */
  let { target, label = 'Skip to content' } = $props();
</script>

<a class="skip-link" href={target}>{label}</a>
