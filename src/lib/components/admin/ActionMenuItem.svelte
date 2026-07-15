<script>
  import PixelIcon from '$lib/components/PixelIcon.svelte';

  /**
   * @typedef {'default'|'danger'} ActionTone
   * @typedef {'idle'|'loading'|'error'|'success'} ActionState
   *
   * @typedef {Object} Props
   * @property {string} label
   * @property {import('$lib/icons/icon-names').IconName} icon
   * @property {string} [href]
   * @property {ActionTone} [tone]
   * @property {'button'|'submit'|'reset'} [type]
   * @property {boolean} [disabled]
   * @property {ActionState} [state]
   * @property {(event: MouseEvent) => void} [onclick]
   */

  /** @type {Props} */
  let {
    label,
    icon,
    href = '',
    tone = 'default',
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
    class="action-menu-item"
    class:action-menu-item--danger={tone === 'danger'}
    data-state={state}
    aria-disabled={inactive ? 'true' : undefined}
    onclick={handleClick}
  >
    <PixelIcon name={stateIcon} size={14} />
    <span>{label}</span>
  </a>
{:else}
  <button
    {type}
    disabled={inactive}
    class="action-menu-item"
    class:action-menu-item--danger={tone === 'danger'}
    data-state={state}
    aria-busy={state === 'loading' ? 'true' : undefined}
    onclick={handleClick}
  >
    <PixelIcon name={stateIcon} size={14} />
    <span>{label}</span>
  </button>
{/if}

<style>
  .action-menu-item {
    display: flex;
    width: 100%;
    min-height: 44px;
    align-items: center;
    gap: 9px;
    padding: 10px 12px;
    border: 0;
    background: transparent;
    color: var(--color-paper);
    font-family: var(--font-mono);
    font-size: 11px;
    letter-spacing: 0.06em;
    text-align: left;
    text-decoration: none;
    white-space: nowrap;
    cursor: pointer;
    transition: background-color 120ms cubic-bezier(0.16, 1, 0.3, 1), color 120ms cubic-bezier(0.16, 1, 0.3, 1), transform 100ms cubic-bezier(0.16, 1, 0.3, 1);
  }

  .action-menu-item--danger,
  .action-menu-item[data-state='error'] { color: var(--color-rose); }
  .action-menu-item[data-state='success'] { color: var(--color-paper-2); }

  .action-menu-item:focus-visible {
    outline: 2px solid var(--color-rose);
    outline-offset: -2px;
  }

  .action-menu-item:active:not(:disabled):not([aria-disabled='true']) {
    transform: translateY(1px);
  }

  .action-menu-item:disabled,
  .action-menu-item[aria-disabled='true'] { opacity: 0.5; cursor: not-allowed; }

  @media (hover: hover) and (pointer: fine) {
    .action-menu-item:hover {
      background: var(--admin-accent-wash-strong);
      color: var(--color-rose);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .action-menu-item { transition-duration: 0ms; }
  }
</style>
