<script>
  /**
   * ContactList renders three-column rows on /about: key | value | arrow.
   *
   * @typedef {Object} Contact
   * @property {string}  label
   * @property {string}  href
   * @property {string}  value
   * @property {string} [note]
   * @property {boolean}[external]
   *
   * @typedef {Object} Props
   * @property {Contact[]} items
   */

  /** @type {Props} */
  let { items } = $props();
</script>

<div class="links flex flex-col py-1 pb-1.5">
  {#each items as c}
    <a
      class="row"
      href={c.href}
      rel={c.external ? 'me noopener' : undefined}
      target={c.external ? '_blank' : undefined}
    >
      <span class="key">{c.label}</span>
      <span class="val">
        {c.value}
        {#if c.note}<span class="note">{c.note}</span>{/if}
      </span>
      <span class="arrow" aria-hidden="true">↗</span>
    </a>
  {/each}
</div>

<style>
  .row {
    display: grid;
    grid-template-columns: 110px 1fr auto;
    gap: 18px;
    align-items: baseline;
    padding: 16px 0;
    border-bottom: 1px solid var(--line-soft);
    transition: color 0.15s;
  }
  .row:last-child { border-bottom: 0; }
  .row:hover                { color: var(--color-rose); }
  .row:hover .key           { color: var(--color-rose); }
  .row:hover .arrow         { color: var(--color-rose); transform: translateX(3px); }

  .key {
    font-family: var(--font-mono);
    font-size: 11px;
    letter-spacing: 0.18em;
    color: var(--color-muted);
    text-transform: uppercase;
    transition: color 0.15s;
  }
  .val {
    font-family: var(--font-serif);
    font-size: 16px;
    color: var(--color-paper);
    line-height: 1.4;
    overflow-wrap: anywhere;
  }
  .val .note {
    display: block;
    margin-top: 3px;
    font-family: var(--font-sans);
    font-size: 12px;
    color: var(--color-muted);
  }
  .arrow {
    font-family: var(--font-mono);
    color: var(--color-muted);
    transition: color 0.15s, transform 0.15s;
  }

  @media (max-width: 600px) {
    .row     { grid-template-columns: 1fr auto; gap: 6px 12px; padding: 14px 0; }
    .key     { grid-column: 1; font-size: 10px; }
    .val     { grid-column: 1 / -1; font-size: 15px; }
    .arrow   { grid-row: 1; grid-column: 2; }
  }
</style>
