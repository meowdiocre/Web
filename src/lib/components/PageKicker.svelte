<script>
  import { SITE } from '$lib/config/site.js';

  /**
   * @typedef {Object} Props
   * @property {string} label
   * @property {string} [brand]
   * @property {'muted'|'muted-warm'} [tone]
   */

  /** @type {Props} */
  let { label, brand = SITE.brand, tone = 'muted' } = $props();

  const colour = $derived(tone === 'muted-warm' ? 'text-muted-warm' : 'text-muted');
</script>

<p
  class="
    mb-[18px] font-mono text-[11px] tracking-[0.22em] uppercase
    {colour}
  "
>
  {label}<span class="mx-2 opacity-50">/</span>{brand}
</p>
