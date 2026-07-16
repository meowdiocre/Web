// @vitest-environment happy-dom
import '@testing-library/jest-dom/vitest';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/svelte/pure';
import { createRawSnippet } from 'svelte';
import { afterEach, describe, expect, it, vi } from 'vitest';
import AdminButton from '$lib/components/admin/AdminButton.svelte';
import ActionMenu from '$lib/components/admin/ActionMenu.svelte';
import ActionMenuItem from '$lib/components/admin/ActionMenuItem.svelte';
import CategoryForm from '$lib/components/admin/CategoryForm.svelte';
import CategoryIconPicker from '$lib/components/admin/CategoryIconPicker.svelte';
import IconPicker from '$lib/components/admin/IconPicker.svelte';
import ThumbnailField from '$lib/components/admin/ThumbnailField.svelte';

afterEach(() => vi.unstubAllGlobals());

describe('admin controls', () => {
  it('renders a labeled action link', () => {
    render(AdminButton, { href: '/admin/posts/new', icon: 'plus', label: 'new post', variant: 'primary' });
    expect(screen.getByRole('link', { name: 'new post' })).toHaveAttribute('href', '/admin/posts/new');
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
