<script>
  /**
   * @typedef {Object} Props
   * @property {string}  title
   * @property {string} [aside]
   * @property {'dark'|'cream'} [palette]
   */

  /** @type {Props} */
  let { title, aside, palette = 'dark' } = $props();
</script>

<div class="row-head" class:cream={palette === 'cream'}>
  <b>{title}</b>
  {#if aside}<span class="aside">{aside}</span>{/if}
</div>

<style>
  .row-head {
    display: flex;
    align-items: baseline;
    gap: 14px;
    margin-top: 36px;
    padding: 18px 0 14px;
    border-bottom: 1px solid var(--line);
    font-family: var(--font-mono);
    font-size: 11px;
    letter-spacing: 0.22em;
    text-transform: uppercase;
    color: var(--color-muted);
  }
  .row-head:first-child { margin-top: 0; }
  .row-head b      { color: var(--color-paper); font-weight: 500; }
  .row-head .aside { margin-left: auto; color: var(--color-muted); font-weight: 400; letter-spacing: 0.14em; }

  .row-head.cream         { border-bottom-color: var(--rule); color: var(--color-muted-warm); }
  .row-head.cream b       { color: #2a1c14; }
  .row-head.cream .aside  { color: var(--color-muted-warm); }

  @media (max-width: 600px) { .row-head { font-size: 10px; padding: 14px 0 10px; } }
</style>
