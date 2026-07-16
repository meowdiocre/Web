<script>
  import { navigating } from '$app/stores';

  const isNavigating = $derived(Boolean($navigating));
</script>

{#if isNavigating}
  <div class="route-progress fixed top-0 left-0 z-[120] h-[3px] w-full overflow-hidden bg-rose/10" aria-hidden="true"></div>
{/if}

<style>
  .route-progress::after {
    content: '';
    display: block;
    width: 35%;
    height: 100%;
    background: linear-gradient(90deg, var(--color-crimson), var(--color-rose));
    box-shadow: var(--shadow-progress);
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
