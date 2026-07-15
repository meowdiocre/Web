<script>
  import { reveal } from '$lib/motion/reveal';

  /** @typedef {{ year: number|string, count: number }} Props */

  /** @type {Props} */
  let { year, count } = $props();
</script>

<div class="row" use:reveal={{ y: 10 }}>
  <b>{year}</b>
  <span class="n">{count} {count === 1 ? 'entry' : 'entries'}</span>
</div>

<style>
  .row {
    display: flex;
    align-items: baseline;
    gap: 14px;
    margin-top: 36px;
    padding: 18px 0 14px;
    border-bottom: 1px solid var(--rule);
    font-family: var(--font-mono);
    font-size: 11px;
    letter-spacing: 0.22em;
    color: var(--color-muted-warm);
  }
  .row:first-child { margin-top: 0; }
  .row b {
    color: #2a1c14;
    font-weight: 500;
    text-transform: uppercase;
  }
  .row .n {
    margin-left: auto;
    text-transform: lowercase;
  }

  @media (max-width: 600px) { .row { font-size: 10px; padding: 14px 0 10px; } }
</style>
