<script>
  import { SITE } from '$lib/config/site.js';
  import { BRAND_GLYPH } from '$lib/config/motif.js';

  /** @type {{ meta: { hostPath: string } }} */
  let { meta } = $props();

  const ariaLabel = `${SITE.brand} home, session ${SITE.session}@${SITE.host}`;
</script>

<a
  class="
    session inline-flex items-center
    pl-[clamp(14px,2vw,28px)] max-[900px]:pl-[clamp(10px,3vw,14px)]
  "
  href="/"
  data-sveltekit-preload-data="tap"
  data-sveltekit-preload-code="hover"
  aria-label={ariaLabel}
>
  <span
    class="
      inline-flex items-center h-6 px-[9px]
      bg-rose text-ink tracking-[0.08em]
      max-[900px]:h-[26px] max-[460px]:text-[11.5px]
    "
  >
    <span class="text-crimson mr-1 font-display text-[14px] translate-y-[0.5px]">{BRAND_GLYPH}</span>{SITE.session}
  </span>
  <span
    class="
      host pl-2.5 pr-3 text-bone tracking-[0.06em]
      max-[900px]:pl-2.5 max-[900px]:pr-0 max-[900px]:opacity-70 max-[900px]:text-[11.5px]
      max-[600px]:pl-2 max-[600px]:text-[11px] max-[600px]:opacity-60
      max-[460px]:hidden
    "
  >
    <span class="at">@</span>dev<span class="at">:</span><span class="path">{meta.hostPath}</span>
  </span>
</a>

<style>
  .session .at   { color: var(--color-muted); }
  .session .path { color: var(--color-rose); }
</style>
