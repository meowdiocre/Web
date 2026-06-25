<script>
  /**
   * PullQuote - full-width italic block quote bracketed by guillemets.
   *
   * @typedef {Object} Props
   * @property {string} text
   */

  /** @type {Props} */
  let { text } = $props();
</script>

<blockquote class="pull">{text}</blockquote>

<style>
  .pull {
    margin: 56px -16px;
    padding: 36px 22px;
    border-block: 2px solid var(--fg);
    font-family: var(--font-italic);
    font-style: italic;
    font-size: clamp(26px, 3.4vw, 36px);
    line-height: 1.2;
    color: var(--quote);
    text-align: center;
  }
  .pull::before { content: '«'; color: var(--accent); margin-right: 8px; }
  .pull::after  { content: '»'; color: var(--accent); margin-left: 8px; }

  @media (max-width: 900px) { .pull { margin-left: 0; margin-right: 0; } }
</style>
