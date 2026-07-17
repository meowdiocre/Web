// @vitest-environment happy-dom
import '@testing-library/jest-dom/vitest';
import { render, screen, within } from '@testing-library/svelte/pure';
import { fireEvent } from '@testing-library/svelte/pure';
import { describe, expect, it, vi } from 'vitest';
import CategoryList from '$lib/components/admin/CategoryList.svelte';
import CategoryDeleteDialog from '$lib/components/admin/CategoryDeleteDialog.svelte';
import TagList from '$lib/components/admin/TagList.svelte';
import TagMultiSelect from '$lib/components/admin/TagMultiSelect.svelte';
import ArticleTags from '$lib/components/article/ArticleTags.svelte';

describe('category deletion dialog', () => {
  it('offers move and permanent-delete choices for a used category', () => {
    const { container } = render(CategoryDeleteDialog, {
      open: true,
      category: { slug: 'web', label: 'Web', postCount: 3 },
      categories: [
        { slug: 'web', label: 'Web' },
        { slug: 'security', label: 'Security' }
      ],
      onclose: vi.fn()
    });

    expect(screen.getByRole('radio', { name: /move 3 posts/i })).toBeChecked();
    expect(container.querySelector('option[value="security"]')).toHaveTextContent('Security');
    expect(screen.getByText('DELETE 3')).toBeInTheDocument();
  });

  it('shows category post counts and requests deletion', async () => {
    const ondelete = vi.fn();
    const { container } = render(CategoryList, {
      categories: [{ slug: 'web', label: 'Web', icon: 'globe', postCount: 3 }],
      ondelete
    });
    const list = within(container);

    expect(list.getByText(/3 posts/)).toBeInTheDocument();
    await fireEvent.click(list.getByRole('button', { name: 'delete Web' }));
    expect(ondelete).toHaveBeenCalledWith(expect.objectContaining({ slug: 'web' }));
  });
});

describe('tag admin controls', () => {
  it('renders immutable tag slugs, counts, and row actions', async () => {
    const ondelete = vi.fn();
    const { container } = render(TagList, {
      tags: [{ slug: 'svelte', label: 'Svelte', postCount: 4 }],
      ondelete
    });
    const list = within(container);

    expect(list.getByText(/\/svelte/)).toBeInTheDocument();
    expect(list.getByText(/4 posts/)).toBeInTheDocument();
    expect(list.queryByRole('textbox', { name: /slug/i })).not.toBeInTheDocument();
    await fireEvent.click(list.getByRole('button', { name: 'delete Svelte' }));
    expect(ondelete).toHaveBeenCalledWith(expect.objectContaining({ slug: 'svelte' }));
  });

  it('searches and submits multiple selected tags', async () => {
    const { container } = render(TagMultiSelect, {
      tags: [
        { slug: 'svelte', label: 'Svelte' },
        { slug: 'security', label: 'Security' }
      ],
      selected: ['security']
    });
    const selector = within(container);

    await fireEvent.input(selector.getByRole('searchbox', { name: 'search tags' }), {
      target: { value: 'sve' }
    });
    await fireEvent.click(selector.getByRole('checkbox', { name: 'Svelte' }));

    expect([...container.querySelectorAll('input[name="tags"]')]
      .map((input) => input instanceof HTMLInputElement ? input.value : '')
      .sort()).toEqual(['security', 'svelte']);
    expect(selector.getByRole('checkbox', { name: 'Security' })).toBeChecked();
  });
});

describe('public article tags', () => {
  it('links each tag to its public archive', () => {
    const { container } = render(ArticleTags, {
      tags: [
        { slug: 'security', label: 'Security' },
        { slug: 'svelte', label: 'Svelte' }
      ]
    });
    const tags = within(container);

    expect(tags.getByRole('link', { name: 'Security' })).toHaveAttribute('href', '/blog/tag/security');
    expect(tags.getByRole('link', { name: 'Svelte' })).toHaveAttribute('href', '/blog/tag/svelte');
  });
});
