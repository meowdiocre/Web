<script>
  import { SITE } from '$lib/config/site.js';

  /**
   * PageKicker — small uppercase mono header above a page title.
   * Mirrors the "kind / brand" pattern used on /blog, /about, /article.
   *
   * @typedef {Object} Props
   * @property {string}  label    section label (e.g. 'About')
   * @property {string} [brand]   right-side label (defaults to site brand)
   * @property {'muted'|'muted-warm'} [tone]   colour family
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
