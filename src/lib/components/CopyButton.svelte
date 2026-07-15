<script>
  /**
   * @typedef {Object} Props
   * @property {string} value
   * @property {string} [label]
   */
  /** @type {Props} */
  let { value, label = 'Copy' } = $props();

  let copied = $state(false);
  /** @type {ReturnType<typeof setTimeout>|undefined} */
  let timer;

  async function copy() {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(value);
      } else {
        const ta = document.createElement('textarea');
        ta.value = value;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
      }
    } catch (_) {}
    copied = true;
    clearTimeout(timer);
    timer = setTimeout(() => { copied = false; }, 1800);
  }
</script>

<button
  type="button"
  data-copied={copied || undefined}
  onclick={copy}
  class="
    py-[7px] px-3
    border border-[var(--line-strong)]
    bg-transparent
    font-display text-[10px] tracking-[0.06em]
    text-paper
    transition-colors duration-150
    hover:bg-paper hover:text-ink
    data-[copied]:bg-rose data-[copied]:text-ink data-[copied]:border-rose
  "
>
  {copied ? 'Copied ✓' : label}
</button>
