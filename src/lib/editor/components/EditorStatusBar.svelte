<script>
  /**
   * @typedef {Object} Props
   * @property {number} words
   * @property {number} chars
   * @property {number} [autosaveSeconds]
   * @property {string} [shortcutHint]
   */

  /** @type {Props} */
  let {
    words,
    chars,
    autosaveSeconds = 3,
    shortcutHint    = 'ctrl+s · ctrl+k · ctrl+shift+k · ctrl+shift+q'
  } = $props();
</script>

<footer
  class="status-bar -mx-5 -mb-6 flex flex-wrap items-center gap-2 border-t border-[var(--line-soft)] bg-ink-2 px-5 py-2 font-mono text-[10px] tracking-[0.06em] text-muted-warm md:-mx-8 md:mb-0 md:px-8 md:py-2.5"
>
  <span>{words} word{words === 1 ? '' : 's'}</span>
  <span class="sep text-muted-warm opacity-[0.55]" aria-hidden="true">·</span>
  <span>{chars} char{chars === 1 ? '' : 's'}</span>
  <span class="sep text-muted-warm opacity-[0.55]" aria-hidden="true">·</span>
  <span>autosave every {autosaveSeconds}s</span>
  <span class="ml-auto hidden sm:inline">{shortcutHint}</span>
</footer>
