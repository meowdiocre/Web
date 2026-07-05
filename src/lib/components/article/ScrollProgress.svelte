<script>
  import { onMount } from 'svelte';

  let pct = $state(0);

  onMount(() => {
    const el = document.documentElement;

    function update() {
      const max = el.scrollHeight - el.clientHeight;
      pct = max > 0 ? Math.min(100, (el.scrollTop / max) * 100) : 0;
    }

    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  });
</script>

<div
  class="
    fixed top-0 left-0 z-[100] h-[3px]
    bg-[var(--accent)] transition-[width] duration-75
  "
  style="width: {pct}%"
  aria-hidden="true"
></div>
