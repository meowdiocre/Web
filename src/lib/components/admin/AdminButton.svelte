<script>
  import PixelIcon from '$lib/components/PixelIcon.svelte';

  /**
   * @typedef {'primary'|'ghost'|'danger'} ButtonVariant
   * @typedef {'idle'|'loading'|'error'|'success'} ButtonState
   *
   * @typedef {Object} Props
   * @property {string} label
   * @property {import('$lib/icons/icon-names').IconName} icon
   * @property {string} [href]
   * @property {ButtonVariant} [variant]
   * @property {'button'|'submit'|'reset'} [type]
   * @property {boolean} [disabled]
   * @property {ButtonState} [state]
   * @property {(event: MouseEvent) => void} [onclick]
   */

  /** @type {Props} */
  let {
    label,
    icon,
    href = '',
    variant = 'ghost',
    type = 'button',
    disabled = false,
    state = 'idle',
    onclick
  } = $props();

  const inactive = $derived(disabled || state === 'loading');
  const stateIcon = $derived(state === 'success' ? 'check' : state === 'error' ? 'close' : icon);

  /** @param {MouseEvent} event */
  function handleClick(event) {
    if (inactive) {
      event.preventDefault();
      return;
    }
    onclick?.(event);
  }
</script>

{#if href}
  <a
    href={inactive ? undefined : href}
    class="admin-button admin-button--{variant}"
    data-state={state}
    aria-disabled={inactive ? 'true' : undefined}
    onclick={handleClick}
  >
    <PixelIcon name={stateIcon} size={15} />
    <span>{label}</span>
  </a>
{:else}
  <button
    {type}
    disabled={inactive}
    class="admin-button admin-button--{variant}"
    data-state={state}
    aria-busy={state === 'loading' ? 'true' : undefined}
    onclick={handleClick}
  >
    <PixelIcon name={stateIcon} size={15} />
    <span>{label}</span>
  </button>
{/if}

<style>
  /* Hallmark · component: admin button · genre: editorial · theme: existing admin
   * states: default · hover · focus · active · disabled · loading · error · success
   * contrast: project-token pairings
   */
  .admin-button {
    display: inline-flex;
    min-height: 44px;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 10px 16px;
    border: 1px solid transparent;
    background: transparent;
    color: var(--color-paper);
    font-family: var(--font-mono);
    font-size: 11px;
    letter-spacing: 0.08em;
    line-height: 1;
    text-decoration: none;
    white-space: nowrap;
    cursor: pointer;
    transition: background-color 120ms cubic-bezier(0.16, 1, 0.3, 1), border-color 120ms cubic-bezier(0.16, 1, 0.3, 1), color 120ms cubic-bezier(0.16, 1, 0.3, 1), transform 100ms cubic-bezier(0.16, 1, 0.3, 1);
  }

  .admin-button--primary {
    background: var(--color-crimson);
    color: var(--color-paper);
  }

  .admin-button--ghost {
    border-color: var(--line-soft);
  }

  .admin-button--danger {
    border-color: var(--color-crimson-deep);
    color: var(--color-crimson);
  }

  .admin-button:focus-visible {
    outline: 2px solid var(--color-rose);
    outline-offset: 2px;
  }

  .admin-button:active:not(:disabled):not([aria-disabled='true']) {
    transform: translateY(1px);
  }

  .admin-button:disabled,
  .admin-button[aria-disabled='true'] { opacity: 0.5; cursor: not-allowed; }

  .admin-button[data-state='loading'] :global(.pixel-icon) {
    animation: button-loading 800ms steps(8) infinite;
  }

  .admin-button[data-state='error'] { border-color: var(--color-crimson); color: var(--color-rose); }
  .admin-button[data-state='success'] { border-color: var(--color-paper-2); color: var(--color-paper-2); }

  @media (hover: hover) and (pointer: fine) {
    .admin-button--primary:hover { background: var(--color-crimson-deep); }
    .admin-button--ghost:hover { border-color: var(--color-rose); color: var(--color-rose); }
    .admin-button--danger:hover { background: var(--color-crimson-deep); color: var(--color-paper); }
  }

  @keyframes button-loading { to { transform: rotate(1turn); } }

  @media (prefers-reduced-motion: reduce) {
    .admin-button { transition-duration: 0ms; }
    .admin-button[data-state='loading'] :global(.pixel-icon) { animation: none; }
  }
</style>
