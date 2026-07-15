// @vitest-environment happy-dom
import '@testing-library/jest-dom/vitest';
import { render, screen } from '@testing-library/svelte';
import { describe, expect, it } from 'vitest';
import AdminButton from '$lib/components/admin/AdminButton.svelte';
import ActionMenuItem from '$lib/components/admin/ActionMenuItem.svelte';
import CategoryIconPicker from '$lib/components/admin/CategoryIconPicker.svelte';

describe('admin controls', () => {
  it('renders a labeled action link', () => {
    render(AdminButton, { href: '/admin/posts/new', icon: 'plus', label: 'new post', variant: 'primary' });
    expect(screen.getByRole('link', { name: 'new post' })).toHaveAttribute('href', '/admin/posts/new');
  });

  it('renders a danger menu button', () => {
    render(ActionMenuItem, { icon: 'trash', label: 'delete post', tone: 'danger' });
    expect(screen.getByRole('button', { name: 'delete post' })).toHaveClass('action-menu-item--danger');
  });

  it('checks the submitted category icon', () => {
    render(CategoryIconPicker, { value: 'bug' });
    expect(screen.getByRole('radio', { name: 'Bug' })).toBeChecked();
    expect(screen.getAllByRole('radio')).toHaveLength(8);
  });
});
