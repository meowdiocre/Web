<script>
  import { navigating } from '$app/stores';

  const isNavigating = $derived(Boolean($navigating));
</script>

{#if isNavigating}
  <div class="route-progress" aria-hidden="true"></div>
{/if}

<style>
  .route-progress {
    position: fixed;
    top: 0;
    left: 0;
    z-index: 120;
    width: 100%;
    height: 3px;
    overflow: hidden;
    background: rgb(232 156 146 / 0.10);
  }

  .route-progress::after {
    content: '';
    display: block;
    width: 35%;
    height: 100%;
    background: linear-gradient(90deg, var(--color-crimson), var(--color-rose));
    box-shadow: 0 0 14px rgb(232 156 146 / 0.55);
    animation: route-progress-slide 0.9s ease-in-out infinite;
  }

  @keyframes route-progress-slide {
    0% { transform: translateX(-120%); }
    100% { transform: translateX(320%); }
  }

  @media (prefers-reduced-motion: reduce) {
    .route-progress::after {
      width: 100%;
      animation: none;
    }
  }
</style>
