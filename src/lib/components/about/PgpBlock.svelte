<script>
  import CopyButton from '../CopyButton.svelte';

  /**
   * PgpBlock — dark fingerprint card with verification note + copy button.
   *
   * @typedef {Object} Props
   * @property {string}    fingerprint            full single-line fingerprint to copy
   * @property {string[]} [display]               lines shown to the user (default: split fingerprint in half)
   * @property {string}   [note]                  verification note above fingerprint
   */

  /** @type {Props} */
  let {
    fingerprint,
    display,
    note = 'Verify against keys.openpgp.org before encrypting anything sensitive.'
  } = $props();

  // Default display: split into two equal lines for readability.
  const lines = $derived(
    display ?? (() => {
      const groups = fingerprint.split(' ');
      const mid = Math.ceil(groups.length / 2);
      return [groups.slice(0, mid).join(' '), groups.slice(mid).join(' ')];
    })()
  );
</script>

<div class="pgp">
  <span class="note">{note}</span>
  <span class="fp">
    {#each lines as line, i}
      {#if i > 0}<br />{/if}{line}
    {/each}
  </span>
  <CopyButton value={fingerprint} label="Copy fingerprint" />
</div>

<style>
  .pgp {
    margin-top: 18px;
    padding: 18px 20px;
    background: var(--color-ink-2);
    border: 1px solid var(--line);
    font-family: var(--font-mono);
    font-size: 12px;
    letter-spacing: 0.10em;
    color: var(--color-bone);
    line-height: 1.7;
    overflow-wrap: anywhere;
  }
  .note {
    display: block;
    margin-bottom: 12px;
    font-family: var(--font-sans);
    font-size: 12px;
    letter-spacing: 0.01em;
    color: var(--color-muted);
  }
  .fp {
    display: block;
    margin-bottom: 12px;
    color: var(--color-paper);
  }
  @media (max-width: 600px) {
    .pgp { padding: 14px 16px; font-size: 11.5px; letter-spacing: 0.06em; }
  }
</style>
