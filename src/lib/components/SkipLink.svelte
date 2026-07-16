<script>
  /**
   * @typedef {Object} Props
   * @property {string} target
   * @property {string} [label]
   */

  /** @type {Props} */
  let { target, label = 'Skip to content' } = $props();
</script>

<a class="absolute -top-24 left-4 z-[100] inline-flex min-h-11 items-center bg-paper px-4 py-2.5 font-display text-[11px] tracking-[0.18em] text-ink uppercase [clip-path:polygon(5%_0,100%_0,95%_100%,0_100%)] transition-[top] duration-150 focus:top-3.5 focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-ink" href={target}>{label}</a>
