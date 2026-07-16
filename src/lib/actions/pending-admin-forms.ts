type Submitter = HTMLButtonElement | HTMLInputElement;

interface PendingState {
  form: HTMLFormElement;
  submitter: Submitter | null;
  label: HTMLElement | null;
  labelText: string;
  inputValue: string;
  disabled: boolean;
  formBusy: string | null;
  submitterBusy: string | null;
  state: string | null;
}

function isSubmitter(value: HTMLElement | null): value is Submitter {
  return value instanceof HTMLButtonElement || value instanceof HTMLInputElement;
}

export function pendingAdminForms(node: HTMLElement) {
  const pending = new Set<HTMLFormElement>();
  const states = new Map<HTMLFormElement, PendingState>();

  function reset(form: HTMLFormElement) {
    const saved = states.get(form);
    pending.delete(form);
    states.delete(form);
    if (!saved) return;

    if (saved.formBusy === null) saved.form.removeAttribute('aria-busy');
    else saved.form.setAttribute('aria-busy', saved.formBusy);

    if (!saved.submitter) return;
    saved.submitter.disabled = saved.disabled;
    if (saved.submitterBusy === null) saved.submitter.removeAttribute('aria-busy');
    else saved.submitter.setAttribute('aria-busy', saved.submitterBusy);
    if (saved.state === null) saved.submitter.removeAttribute('data-state');
    else saved.submitter.setAttribute('data-state', saved.state);
    if (saved.label) saved.label.textContent = saved.labelText;
    if (saved.submitter instanceof HTMLInputElement) saved.submitter.value = saved.inputValue;
  }

  function markPending(form: HTMLFormElement, submitter: Submitter | null) {
    const label = submitter?.querySelector<HTMLElement>('[data-action-label]') ?? null;
    states.set(form, {
      form,
      submitter,
      label,
      labelText: label?.textContent ?? '',
      inputValue: submitter instanceof HTMLInputElement ? submitter.value : '',
      disabled: submitter?.disabled ?? false,
      formBusy: form.getAttribute('aria-busy'),
      submitterBusy: submitter?.getAttribute('aria-busy') ?? null,
      state: submitter?.getAttribute('data-state') ?? null
    });

    form.setAttribute('aria-busy', 'true');
    if (!submitter) return;

    const loadingLabel = submitter.dataset.loadingLabel;
    submitter.disabled = true;
    submitter.setAttribute('aria-busy', 'true');
    submitter.setAttribute('data-state', 'loading');
    if (loadingLabel && label) label.textContent = loadingLabel;
    if (loadingLabel && submitter instanceof HTMLInputElement) submitter.value = loadingLabel;
  }

  function onSubmit(event: Event) {
    if (!(event instanceof SubmitEvent) || !(event.target instanceof HTMLFormElement)) return;
    const form = event.target;
    if (pending.has(form)) {
      event.preventDefault();
      return;
    }

    pending.add(form);
    const submitter = event.submitter instanceof HTMLElement && isSubmitter(event.submitter)
      ? event.submitter
      : null;

    queueMicrotask(() => {
      if (event.defaultPrevented) {
        pending.delete(form);
        return;
      }
      markPending(form, submitter);
    });
  }

  function resetAll() {
    for (const form of states.keys()) reset(form);
  }

  node.addEventListener('submit', onSubmit);
  window.addEventListener('pageshow', resetAll);

  return {
    destroy() {
      node.removeEventListener('submit', onSubmit);
      window.removeEventListener('pageshow', resetAll);
      resetAll();
    }
  };
}
