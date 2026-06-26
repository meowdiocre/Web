<!--
  StatusPill — the small mono uppercase chip used to flag a post's
  workflow state. Renders `.status` + `.status--{value}` so colour
  comes from the admin-scoped CSS in app.css.

  Adding a new status only needs a new `.status--<name>` colour rule
  in app.css; this component stays one line of markup.
-->
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
