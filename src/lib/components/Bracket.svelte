<script>
  /**
   * @typedef {Object} Props
   * @property {'tl'|'tr'|'bl'|'br'} pos
   */

  /** @type {Props} */
  let { pos } = $props();
</script>

<svg
  class="bracket {pos}"
  aria-hidden="true"
><use href="#bracket" /></svg>

<style>
  .bracket {
    position: absolute;
    width: 26px; height: 26px;
    color: var(--color-bone);
    opacity: 0.28;
    pointer-events: none;
    z-index: 1;
  }
  .tl { top: clamp(18px, 3vw, 32px); left: clamp(18px, 3vw, 32px); }
  .tr { top: clamp(18px, 3vw, 32px); right: clamp(18px, 3vw, 32px); transform: scaleX(-1); }
  .bl { bottom: clamp(18px, 3vw, 32px); left: clamp(18px, 3vw, 32px); transform: scaleY(-1); }
  .br { bottom: clamp(18px, 3vw, 32px); right: clamp(18px, 3vw, 32px); transform: scale(-1, -1); }

  @media (max-width: 760px) { .bracket { display: none; } }
</style>
