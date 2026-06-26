<!--
  EditorStatusBar — thin footer that hugs the bottom of the canvas and
  shows word/char counts + autosave cadence. Keyboard hint hides on
  narrow viewports.
-->
<script>
  /**
   * @typedef {Object} Props
   * @property {number} words
   * @property {number} chars
   * @property {number} [autosaveSeconds]   default 3
   * @property {string} [shortcutHint]      override the bundled hint line
   */

  /** @type {Props} */
  let {
    words,
    chars,
    autosaveSeconds = 3,
    shortcutHint    = 'ctrl+s · ctrl+k · ctrl+shift+k · ctrl+shift+q'
  } = $props();
</script>

<footer class="status-bar font-mono text-[10px] tracking-[0.16em] uppercase">
  <span>{words} word{words === 1 ? '' : 's'}</span>
  <span class="sep" aria-hidden="true">·</span>
  <span>{chars} char{chars === 1 ? '' : 's'}</span>
  <span class="sep" aria-hidden="true">·</span>
  <span>autosave every {autosaveSeconds}s</span>
  <span class="ml-auto hidden sm:inline">{shortcutHint}</span>
</footer>

<style>
  .status-bar {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 8px;
    margin: 0 -20px -24px;
    padding: 8px 20px;
    background: var(--color-ink-2);
    color: var(--color-muted-warm);
    border-top: 1px solid var(--line-soft);
  }
  @media (min-width: 768px) {
    .status-bar { margin: 0 -32px 0; padding: 10px 32px; }
  }
  .status-bar .sep { color: var(--color-muted-warm); opacity: 0.55; }
</style>
