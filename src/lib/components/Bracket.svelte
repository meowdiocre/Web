<script>
  /**
   * @typedef {Object} Props
   * @property {'tl'|'tr'|'bl'|'br'} pos
   */

  /** @type {Props} */
  let { pos } = $props();

  const positionClasses = {
    tl: 'top-[clamp(18px,3vw,32px)] left-[clamp(18px,3vw,32px)]',
    tr: 'top-[clamp(18px,3vw,32px)] right-[clamp(18px,3vw,32px)] -scale-x-100',
    bl: 'bottom-[clamp(18px,3vw,32px)] left-[clamp(18px,3vw,32px)] -scale-y-100',
    br: 'bottom-[clamp(18px,3vw,32px)] right-[clamp(18px,3vw,32px)] scale-[-1]'
  };
</script>

<svg
  class="pointer-events-none absolute z-[1] size-[26px] text-bone opacity-[0.28] max-[760px]:hidden {positionClasses[pos]}"
  aria-hidden="true"
><use href="#bracket" /></svg>
