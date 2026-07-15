// @vitest-environment happy-dom
import '@testing-library/jest-dom/vitest';
import { fireEvent, render, screen, within } from '@testing-library/svelte/pure';
import { createRawSnippet } from 'svelte';
import { describe, expect, it } from 'vitest';
import AdminButton from '$lib/components/admin/AdminButton.svelte';
import ActionMenu from '$lib/components/admin/ActionMenu.svelte';
import ActionMenuItem from '$lib/components/admin/ActionMenuItem.svelte';
import CategoryForm from '$lib/components/admin/CategoryForm.svelte';
import CategoryIconPicker from '$lib/components/admin/CategoryIconPicker.svelte';
import IconPicker from '$lib/components/admin/IconPicker.svelte';

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
});
