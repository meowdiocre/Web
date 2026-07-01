<script>
  import { navigating } from '$app/stores';

  const isNavigating = $derived(Boolean($navigating));
  const label = $derived(($navigating?.to?.url?.pathname ?? '/').replace(/^\/+/, '') || 'home');
</script>

{#if isNavigating}
  <div class="route-progress" aria-hidden="true"></div>
  <div class="route-label" role="status" aria-live="polite">
    loading {label}
  </div>
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

  .route-label {
    position: fixed;
    right: 16px;
    bottom: 16px;
    z-index: 120;
    padding: 6px 10px;
    background: rgb(10 9 8 / 0.92);
    border: 1px solid rgb(232 156 146 / 0.28);
    color: var(--color-paper);
    font-family: var(--font-mono);
    font-size: 11px;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    box-shadow: 0 12px 24px rgb(0 0 0 / 0.28);
  }

  @keyframes route-progress-slide {
    0% { transform: translateX(-120%); }
    100% { transform: translateX(320%); }
  }

  @media (max-width: 640px) {
    .route-label {
      right: 10px;
      bottom: 10px;
      font-size: 10px;
      padding: 5px 8px;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .route-progress::after {
      width: 100%;
      animation: none;
    }
  }
</style>
