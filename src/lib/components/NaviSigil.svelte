<script>
  import { SITE } from '$lib/config/site.js';

  /**
   * NaviSigil is a Wired-style HUD reticle with a small caption beneath.
   * Used in the right column of /about's head.
   *
   * @typedef {{ caption?: string, role?: string }} Props
   */

  /** @type {Props} */
  let { caption = SITE.brand, role = 'obby' } = $props();
</script>

<aside
  class="
    sigil
    w-[clamp(90px,12vw,128px)] self-start mt-1.5
    max-[600px]:w-[72px] max-[600px]:order-[-1] max-[600px]:justify-self-start
    max-[600px]:m-0 max-[600px]:mb-1
  "
  aria-hidden="true"
>
  <svg class="reticle" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <!-- outer rings -->
    <circle class="ring"       cx="50" cy="50" r="44" />
    <circle class="ring-thick" cx="50" cy="50" r="32" />

    <!-- compass cross (faint) -->
    <line class="cross" x1="50" y1="6"  x2="50" y2="94" />
    <line class="cross" x1="6"  y1="50" x2="94" y2="50" />

    <!-- compass tick stubs at N/E/S/W -->
    <line class="tick" x1="50" y1="6"  x2="50" y2="12" />
    <line class="tick" x1="50" y1="88" x2="50" y2="94" />
    <line class="tick" x1="6"  y1="50" x2="12" y2="50" />
    <line class="tick" x1="88" y1="50" x2="94" y2="50" />

    <!-- diagonal ticks at 45° intervals -->
    <line class="tick small" x1="22.2" y1="22.2" x2="26" y2="26" />
    <line class="tick small" x1="77.8" y1="22.2" x2="74" y2="26" />
    <line class="tick small" x1="22.2" y1="77.8" x2="26" y2="74" />
    <line class="tick small" x1="77.8" y1="77.8" x2="74" y2="74" />

    <!-- null-set slash + center dot -->
    <line class="slash" x1="30" y1="70" x2="70" y2="30" />
    <circle class="dot" cx="50" cy="50" r="1.8" />
  </svg>

  <div class="cap">
    <span><b>{caption}</b> · {role}</span>
    <span>04</span>
  </div>
</aside>

<style>
  .reticle {
    width: 100%;
    height: auto;
    aspect-ratio: 1 / 1;
    color: var(--color-rose);
    opacity: 0.78;
  }

  /* SVG primitives */
  .ring,
  .ring-thick { stroke: currentColor; fill: none; }
  .ring       { stroke-width: 1; }
  .ring-thick { stroke-width: 1.5; }
  .tick       { stroke: currentColor; stroke-width: 2; }
  .tick.small { stroke-width: 1; }
  .cross      { stroke: currentColor; stroke-width: 1; opacity: 0.55; }
  .slash      { stroke: var(--color-crimson); stroke-width: 1.5; }
  .dot        { fill: var(--color-crimson); }

  .cap {
    margin-top: 8px;
    display: flex;
    justify-content: space-between;
    font-family: var(--font-terminal);
    font-size: 10px;
    letter-spacing: 0.16em;
    text-transform: lowercase;
    color: var(--color-muted);
    opacity: 0.75;
  }
  .cap b { color: var(--color-rose); font-weight: 400; }

  @media (max-width: 600px) { .cap { font-size: 9px; gap: 12px; } }
</style>
