<script>
  /**
   * SkipLink is the first focusable element on every page. Hidden until
   * focused; jumps the user past the nav into main content.
   *
   * @typedef {Object} Props
   * @property {string} target  fragment id (e.g. '#hero')
   * @property {string} [label] visible label
   */

  /** @type {Props} */
  let { target, label = 'Skip to content' } = $props();
</script>

<a class="skip-link" href={target}>{label}</a>
