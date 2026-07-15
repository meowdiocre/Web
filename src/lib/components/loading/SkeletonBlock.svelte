<script>
  /** @type {{ width?: string, height?: string, radius?: string, className?: string }} */
  let {
    width = '100%',
    height = '1rem',
    radius = '0px',
    className = ''
  } = $props();
</script>

<div
  class={`skeleton-block ${className}`.trim()}
  style={`--skeleton-width:${width}; --skeleton-height:${height}; --skeleton-radius:${radius};`}
  aria-hidden="true"
></div>

<style>
  .skeleton-block {
    width: var(--skeleton-width);
    height: var(--skeleton-height);
    border-radius: var(--skeleton-radius);
    background: rgb(122 106 90 / 0.10);
    position: relative;
    overflow: hidden;
  }
  .skeleton-block::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(
      90deg,
      transparent 0%,
      rgb(255 255 255 / 0.32) 50%,
      transparent 100%
    );
    transform: translateX(-100%);
    animation: skeleton-sweep 1.4s ease-in-out infinite;
  }

  @keyframes skeleton-sweep {
    from { transform: translateX(-100%); }
    to   { transform: translateX(100%); }
  }

  @media (prefers-reduced-motion: reduce) {
    .skeleton-block::after { animation: none; opacity: 0; }
  }
</style>
