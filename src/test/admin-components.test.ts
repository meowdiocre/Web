// @vitest-environment happy-dom
import '@testing-library/jest-dom/vitest';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/svelte/pure';
import { createRawSnippet } from 'svelte';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { afterEach, describe, expect, it, vi } from 'vitest';
import Field from '$lib/components/Field.svelte';
import AdminButton from '$lib/components/admin/AdminButton.svelte';
import ActionMenu from '$lib/components/admin/ActionMenu.svelte';
import ActionMenuItem from '$lib/components/admin/ActionMenuItem.svelte';
import { pendingAdminForms } from '$lib/actions/pending-admin-forms';
import CategoryForm from '$lib/components/admin/CategoryForm.svelte';
import CategoryIconPicker from '$lib/components/admin/CategoryIconPicker.svelte';
import IconPicker from '$lib/components/admin/IconPicker.svelte';
import PageHeader from '$lib/components/admin/PageHeader.svelte';
import PanelCard from '$lib/components/admin/PanelCard.svelte';
import PostDraftForm from '$lib/components/admin/PostDraftForm.svelte';
import PostSeoFields from '$lib/components/admin/PostSeoFields.svelte';
import ThumbnailField from '$lib/components/admin/ThumbnailField.svelte';
import EditorToolbar from '$lib/editor/components/EditorToolbar.svelte';
import ConfirmDialog from '$lib/editor/dialogs/ConfirmDialog.svelte';

afterEach(() => vi.unstubAllGlobals());

describe('admin controls', () => {
  it('renders a labeled action link', () => {
    render(AdminButton, { href: '/admin/posts/new', icon: 'plus', label: 'new post', variant: 'primary' });
    const link = screen.getByRole('link', { name: 'new post' });
    expect(link).toHaveAttribute('href', '/admin/posts/new');
    expect(link).toHaveAttribute('data-variant', 'primary');
  });

  it('renders compact page headings with optional actions', () => {
    const actions = createRawSnippet(() => ({ render: () => '<a href="/admin/posts/new">new post</a>' }));
    const { container } = render(PageHeader, {
      eyebrow: '~/admin/posts',
      title: 'posts',
      icon: 'article',
      description: 'Manage published and draft posts.',
      actions
    });
    const header = within(container);

    expect(header.getByRole('heading', { level: 1, name: 'posts' })).toBeInTheDocument();
    expect(header.getByRole('link', { name: 'new post' })).toHaveAttribute('href', '/admin/posts/new');
  });

  it('uses a balanced metadata grid on very wide screens', () => {
    const page = readFileSync(resolve('src/routes/admin/posts/[id]/+page.svelte'), 'utf8');

    expect(page).toContain('2xl:max-w-[1200px]');
    expect(page).toContain('2xl:grid-cols-[minmax(0,1fr)_360px]');
  });

  it('opens and updates the shared select control', async () => {
    const { container } = render(Field, {
      name: 'category',
      label: 'category',
      kind: 'select',
      value: 'reverse',
      options: [
        { value: 'reverse', label: 'Reverse' },
        { value: 'ml', label: 'ML' }
      ]
    });
    const field = within(container);

    await fireEvent.click(field.getByRole('button', { name: /category reverse/i }));
    expect(field.getByRole('listbox')).toBeInTheDocument();
    await fireEvent.click(field.getByRole('option', { name: 'ML' }));

    expect(container.querySelector('select[name="category"]')).toHaveValue('ml');
    expect(field.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('supports keyboard selection in the shared select control', async () => {
    const { container } = render(Field, {
      name: 'category',
      label: 'category',
      kind: 'select',
      value: 'reverse',
      options: [
        { value: 'reverse', label: 'Reverse' },
        { value: 'ml', label: 'ML' }
      ]
    });
    const field = within(container);
    const trigger = field.getByRole('button', { name: /category reverse/i });

    await fireEvent.keyDown(trigger, { key: 'ArrowDown' });
    const selected = field.getByRole('option', { name: 'Reverse' });
    expect(selected).toHaveFocus();
    await fireEvent.keyDown(selected, { key: 'ArrowDown' });
    const next = field.getByRole('option', { name: 'ML' });
    expect(next).toHaveFocus();
    await fireEvent.keyDown(next, { key: 'Enter' });

    expect(container.querySelector('select[name="category"]')).toHaveValue('ml');
    expect(trigger).toHaveFocus();
  });

  it('labels shared admin sections for assistive technology', () => {
    const children = createRawSnippet(() => ({ render: () => '<p>Section content</p>' }));
    const { container } = render(PanelCard, {
      title: 'all posts',
      icon: 'article',
      description: 'Published and draft posts.',
      children
    });
    const panel = within(container);

    expect(panel.getByRole('region', { name: 'all posts' })).toBeInTheDocument();
    expect(panel.getByRole('heading', { level: 2, name: 'all posts' }))
      .toHaveClass('font-sans', 'text-lg', 'font-semibold');
    expect(panel.getByText('Published and draft posts.')).toHaveClass('text-sm', 'text-muted');
  });

  it('uses shared section legends across admin metadata forms', () => {
    const metadataPage = readFileSync(resolve('src/routes/admin/posts/[id]/+page.svelte'), 'utf8');
    const tagSelector = readFileSync(resolve('src/lib/components/admin/TagMultiSelect.svelte'), 'utf8');
    const categoryDialog = readFileSync(resolve('src/lib/components/admin/CategoryDeleteDialog.svelte'), 'utf8');

    expect(metadataPage.match(/<AdminSectionLegend/g) ?? []).toHaveLength(3);
    expect(tagSelector).toContain('<AdminSectionLegend title="tags" />');
    expect(categoryDialog).toContain('<AdminSectionLegend title="resolve assigned posts"');
    expect(categoryDialog).toContain('font-sans text-sm font-medium text-paper');
    expect(categoryDialog).toContain('font-sans text-sm font-medium text-rose');
  });

  it('renders modal and disclosure titles as headings instead of field labels', () => {
    const modal = render(ConfirmDialog, {
      open: true,
      title: 'delete post?',
      onconfirm: vi.fn(),
      onclose: vi.fn()
    });
    try {
      const modalTitle = screen.getByRole('heading', { level: 2, name: 'delete post?' });
      expect(modalTitle).toHaveClass('font-sans', 'text-base', 'font-semibold');
    } finally {
      modal.unmount();
    }

    const seo = render(PostSeoFields, { values: {} });
    try {
      const summary = within(seo.container).getByText('search and social').closest('summary');
      expect(summary).toHaveClass('font-sans', 'text-base', 'font-semibold');
    } finally {
      seo.unmount();
    }
  });

  it('keeps generated post slugs in advanced options', () => {
    const { container } = render(PostDraftForm, {
      categories: [{ slug: 'reverse', label: 'Reverse' }]
    });
    const form = within(container);
    const advanced = container.querySelector('details');

    expect(advanced).not.toBeNull();
    expect(advanced).not.toHaveAttribute('open');
    expect(form.getByText(/custom slug/i)).toBeInTheDocument();
    expect(form.getByRole('link', { name: /manage categories/i }))
      .toHaveAttribute('href', '/admin/categories');
  });

  it('opens advanced post options again after a validation failure', () => {
    const { container } = render(PostDraftForm, {
      categories: [{ slug: 'reverse', label: 'Reverse' }],
      values: { slug: 'custom-slug' }
    });

    expect(container.querySelector('details')).toHaveAttribute('open');
  });

  it('renders a danger menu button', () => {
    render(ActionMenuItem, { icon: 'trash', label: 'delete post', tone: 'danger' });
    expect(screen.getByRole('button', { name: 'delete post' })).toHaveClass('action-menu-item--danger');
  });

  it('uses disclosure semantics for action controls', async () => {
    const children = createRawSnippet(() => ({ render: () => '<button type="button">edit post</button>' }));
    const { container } = render(ActionMenu, { children });
    const menu = within(container);

    const trigger = menu.getByRole('button', { name: 'Open actions' });
    await fireEvent.click(trigger);

    expect(menu.queryByRole('menu')).not.toBeInTheDocument();
    await fireEvent.click(menu.getByRole('button', { name: 'edit post' }));
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });

  it('restores trigger focus when Escape closes action controls', async () => {
    const children = createRawSnippet(() => ({ render: () => '<button type="button">edit post</button>' }));
    const { container } = render(ActionMenu, { children });
    const menu = within(container);
    const trigger = menu.getByRole('button', { name: 'Open actions' });

    await fireEvent.click(trigger);
    menu.getByRole('button', { name: 'edit post' }).focus();
    await fireEvent.keyDown(document, { key: 'Escape' });

    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(trigger).toHaveFocus();
  });

  it('submits action-menu forms before closing the menu', async () => {
    const children = createRawSnippet(() => ({
      render: () => '<form><button type="submit">publish now</button></form>'
    }));
    const { container } = render(ActionMenu, { children });
    const menu = within(container);
    const submitted = vi.fn((event: Event) => event.preventDefault());
    container.addEventListener('submit', submitted);

    await fireEvent.click(menu.getByRole('button', { name: 'Open actions' }));
    await fireEvent.click(menu.getByRole('button', { name: 'publish now' }));

    expect(submitted).toHaveBeenCalledOnce();
    expect(menu.getByRole('button', { name: 'Open actions' })).toHaveAttribute('aria-expanded', 'true');
  });

  it('marks submitted admin forms busy and blocks duplicate submits', async () => {
    const root = document.createElement('div');
    root.innerHTML = `
      <form>
        <button type="submit" data-loading-label="publishing...">
          <span data-action-label>publish now</span>
        </button>
      </form>
    `;
    document.body.append(root);
    const action = pendingAdminForms(root);
    const form = root.querySelector('form')!;
    const button = root.querySelector('button')!;

    form.dispatchEvent(new SubmitEvent('submit', { bubbles: true, cancelable: true, submitter: button }));
    await Promise.resolve();

    expect(form).toHaveAttribute('aria-busy', 'true');
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute('data-state', 'loading');
    expect(button).toHaveTextContent('publishing...');

    const duplicate = new SubmitEvent('submit', { bubbles: true, cancelable: true, submitter: button });
    form.dispatchEvent(duplicate);
    expect(duplicate.defaultPrevented).toBe(true);

    action.destroy();
    root.remove();
  });

  it('does not leave client-only dialog forms pending', async () => {
    const root = document.createElement('div');
    root.innerHTML = '<form><button type="submit">apply</button></form>';
    document.body.append(root);
    const action = pendingAdminForms(root);
    const form = root.querySelector('form')!;
    const button = root.querySelector('button')!;
    form.addEventListener('submit', (event) => event.preventDefault());

    form.dispatchEvent(new SubmitEvent('submit', { bubbles: true, cancelable: true, submitter: button }));
    await Promise.resolve();

    expect(form).not.toHaveAttribute('aria-busy');
    expect(button).not.toBeDisabled();

    action.destroy();
    root.remove();
  });

  it('keeps destructive confirmation visible while deletion is pending', () => {
    render(ConfirmDialog, {
      open: true,
      confirmLabel: 'delete permanently',
      pending: true,
      pendingLabel: 'deleting...',
      onconfirm: vi.fn(),
      onclose: vi.fn()
    });

    expect(screen.getByRole('button', { name: 'deleting...' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'deleting...' })).toHaveAttribute('aria-busy', 'true');
    expect(screen.getByRole('button', { name: 'cancel' })).toBeDisabled();
  });

  it('searches all installed icons from the category picker', async () => {
    const { container } = render(CategoryIconPicker, { value: 'bug' });
    const picker = within(container);

    await fireEvent.input(picker.getByRole('searchbox', { name: 'search icons' }), {
      target: { value: 'alien' }
    });

    expect(picker.getByRole('radio', { name: 'alien' })).toBeInTheDocument();
  });

  it('keeps the selected icon in the category form', () => {
    // ponytail: happy-dom cannot tear down a root form; use a scoped pure render until its Svelte cleanup is fixed.
    const { container } = render(CategoryForm, { values: { label: 'Systems', slug: 'systems', icon: 'cpu' } });
    const form = within(container);
    expect(form.getByRole('radio', { name: 'CPU' })).toBeChecked();
    expect(form.getByRole('button', { name: 'create category' })).toBeInTheDocument();
  });

  it('keeps optional category slugs under advanced options', () => {
    const { container } = render(CategoryForm, { values: {} });
    const advanced = container.querySelector('details');

    expect(advanced).not.toBeNull();
    expect(advanced).not.toHaveAttribute('open');
    expect(within(container).getByText(/custom slug/i)).toBeInTheDocument();
  });

  it('collapses optional SEO overrides when they are unused', () => {
    const { container } = render(PostSeoFields, { values: {} });
    const details = container.querySelector('details');

    expect(details).not.toBeNull();
    expect(details).not.toHaveAttribute('open');
    expect(within(container).getByText(/^search and social$/i)).toBeInTheDocument();
  });

  it('opens SEO overrides when the post has custom values', () => {
    const { container } = render(PostSeoFields, {
      values: { seoTitle: 'Custom search title' }
    });

    expect(container.querySelector('details')).toHaveAttribute('open');
  });

  it('gives editor toolbar actions descriptive accessible names', () => {
    const editor = { isActive: () => false } as any;
    const noop = vi.fn();
    const { container } = render(EditorToolbar, {
      editor,
      openLink: noop,
      openCode: noop,
      openPull: noop,
      openSidenote: noop,
      openEnd: noop,
      save: noop
    });
    const toolbar = within(container);

    expect(toolbar.getByRole('group', { name: 'Formatting controls' })).toBeInTheDocument();
    expect(toolbar.getByRole('button', { name: /^Bold/ })).toBeInTheDocument();
    expect(toolbar.getByRole('button', { name: /^Italic/ })).toBeInTheDocument();
    expect(toolbar.getByRole('button', { name: /^Inline code/ })).toBeInTheDocument();
    expect(toolbar.getByRole('button', { name: /^Save/ })).toBeInTheDocument();
  });

  it('searches and selects icons outside the recommended set', async () => {
    const { container } = render(IconPicker, { value: 'book-open' });
    const picker = within(container);

    await fireEvent.input(picker.getByRole('searchbox', { name: 'search icons' }), {
      target: { value: 'alien' }
    });
    await fireEvent.click(picker.getByRole('radio', { name: 'alien' }));

    expect(picker.getByRole('radio', { name: 'alien' })).toBeChecked();
  });

  it('matches displayed icon labels with spaces', async () => {
    const { container } = render(IconPicker, { value: 'book-open' });
    const picker = within(container);

    await fireEvent.input(picker.getByRole('searchbox', { name: 'search icons' }), {
      target: { value: 'alarm clock' }
    });

    expect(picker.getByRole('radio', { name: 'alarm clock' })).toBeInTheDocument();
  });

  it('keeps the selected icon available when it does not match the search', async () => {
    const { container } = render(IconPicker, { value: 'alien' });
    const picker = within(container);

    await fireEvent.input(picker.getByRole('searchbox', { name: 'search icons' }), {
      target: { value: 'no-such-icon-name' }
    });

    expect(picker.getByText('No icons found.')).toBeInTheDocument();
    expect(picker.getByRole('radio', { name: 'alien' })).toBeChecked();
  });

  it('limits broad searches to eighty matching radios', async () => {
    const { container } = render(IconPicker, { value: 'a-arrow-down-sharp' });
    const picker = within(container);

    await fireEvent.input(picker.getByRole('searchbox', { name: 'search icons' }), {
      target: { value: 'a' }
    });

    expect(picker.getAllByRole('radio')).toHaveLength(80);
    expect(picker.getByText('Showing the first 80 matches. Refine your search.')).toBeInTheDocument();
  });

  it('uploads a thumbnail and submits its returned URL', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(
      JSON.stringify({ url: 'https://blob.example/thumb.webp' }),
      { status: 200, headers: { 'content-type': 'application/json' } }
    ));
    vi.stubGlobal('fetch', fetchMock);

    const { container } = render(ThumbnailField, { value: '' });
    const field = within(container);
    const file = new File(['image'], 'thumb.webp', { type: 'image/webp' });
    await fireEvent.change(field.getByLabelText('upload thumbnail'), { target: { files: [file] } });

    await waitFor(() => {
      expect(field.getByRole('img', { name: 'thumbnail preview' }))
        .toHaveAttribute('src', 'https://blob.example/thumb.webp');
      expect(field.getByLabelText('thumbnail url')).toHaveValue('https://blob.example/thumb.webp');
    });
    const body = fetchMock.mock.calls[0][1].body as FormData;
    expect(body.get('purpose')).toBe('thumbnail');
  });

  it('removes a selected thumbnail', async () => {
    const { container } = render(ThumbnailField, { value: 'https://example.com/thumb.jpg' });
    const field = within(container);

    await fireEvent.click(field.getByRole('button', { name: 'remove thumbnail' }));

    expect(field.queryByRole('img', { name: 'thumbnail preview' })).not.toBeInTheDocument();
    expect(field.getByLabelText('thumbnail url')).toHaveValue('');
  });

  it('keeps the previous URL when thumbnail upload fails', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('upload failed', { status: 500 })));
    const { container } = render(ThumbnailField, { value: 'https://example.com/old.jpg' });
    const field = within(container);
    const file = new File(['image'], 'thumb.webp', { type: 'image/webp' });

    await fireEvent.change(field.getByLabelText('upload thumbnail'), { target: { files: [file] } });

    await waitFor(() => {
      expect(field.getByRole('alert')).toHaveTextContent('upload failed');
      expect(field.getByLabelText('thumbnail url')).toHaveValue('https://example.com/old.jpg');
    });
  });
});
