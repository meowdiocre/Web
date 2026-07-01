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
    background:
      linear-gradient(
        90deg,
        rgb(122 106 90 / 0.09) 0%,
        rgb(122 106 90 / 0.18) 48%,
        rgb(122 106 90 / 0.09) 100%
      );
    background-size: 220% 100%;
    animation: skeleton-shimmer 1.2s linear infinite;
  }

  @keyframes skeleton-shimmer {
    from { background-position: 200% 0; }
    to   { background-position: -20% 0; }
  }

  @media (prefers-reduced-motion: reduce) {
    .skeleton-block {
      animation: none;
      background: rgb(122 106 90 / 0.13);
    }
  }
</style>
