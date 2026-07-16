<script>
  import { reveal } from '$lib/motion/reveal';

  /** @typedef {{ year: number|string, count: number }} Props */

  /** @type {Props} */
  let { year, count } = $props();
</script>

<div
  class="mt-9 flex items-baseline gap-3.5 border-b border-[var(--rule)] pt-[18px] pb-3.5 font-mono text-[11px] tracking-[0.22em] text-muted-warm first:mt-0 max-[600px]:pt-3.5 max-[600px]:pb-2.5 max-[600px]:text-[10px]"
  use:reveal={{ y: 10 }}
>
  <b class="font-medium uppercase text-paper-ink">{year}</b>
  <span class="ml-auto lowercase">{count} {count === 1 ? 'entry' : 'entries'}</span>
</div>
