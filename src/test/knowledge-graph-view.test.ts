// @vitest-environment happy-dom
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/svelte/pure';
import { afterEach, describe, expect, it, vi } from 'vitest';
import KnowledgeGraphCanvas from '$lib/components/knowledge/KnowledgeGraphCanvas.svelte';
import KnowledgeGraphView from '$lib/components/knowledge/KnowledgeGraphView.svelte';
import { buildKnowledgeGraph } from '$lib/knowledge/graph';

const graph = buildKnowledgeGraph([
  {
    postId: 'post-1',
    postSlug: 'kernel-notes',
    postTitle: 'Kernel notes',
    categorySlug: 'reverse-engineering',
    categoryLabel: 'Reverse engineering',
    categoryIcon: 'bug',
    tagSlug: 'windows',
    tagLabel: 'Windows'
  }
]);

afterEach(cleanup);

describe('knowledge graph view', () => {
  it('selects a graph node with a standard click', async () => {
    const onSelect = vi.fn();
    render(KnowledgeGraphCanvas, {
      nodes: graph.taxonomyNodes,
      links: graph.taxonomyLinks,
      onSelect
    });

    await fireEvent.click(await screen.findByRole('button', { name: /category Reverse engineering/i }));

    expect(onSelect).toHaveBeenCalledWith('category:reverse-engineering');
  });

  it('renders the category icon inside its graph node', async () => {
    render(KnowledgeGraphCanvas, {
      nodes: graph.taxonomyNodes,
      links: graph.taxonomyLinks
    });

    const category = await screen.findByRole('button', { name: /category Reverse engineering/i });
    const icon = within(category).getByTestId('graph-node-icon');

    expect(icon.firstElementChild).toHaveClass(
      'flex',
      'h-full',
      'w-full',
      'items-center',
      'justify-center'
    );
  });

  it('restores the camera after the graph is panned away', async () => {
    const { container } = render(KnowledgeGraphView, { graph });
    const canvas = screen.getByRole('group', { name: /Interactive knowledge graph/i });
    const camera = canvas.children[1];

    await fireEvent.pointerDown(canvas, { button: 0, pointerId: 1, clientX: 20, clientY: 20 });
    await fireEvent.pointerMove(canvas, { pointerId: 1, clientX: 120, clientY: 70 });
    await fireEvent.pointerUp(canvas, { pointerId: 1, clientX: 120, clientY: 70 });

    expect(camera).toHaveAttribute('transform', 'translate(100 50) scale(1)');

    await fireEvent.click(within(container).getByRole('button', { name: 'reset' }));

    await waitFor(() => expect(camera).toHaveAttribute('transform', 'translate(0 0) scale(1)'));
  });

  it('rebuilds dragged node positions when reset is pressed', async () => {
    const { container } = render(KnowledgeGraphView, { graph });
    const category = await screen.findByRole('button', { name: /category Reverse engineering/i });

    await fireEvent.pointerDown(category, { button: 0, pointerId: 2, clientX: 600, clientY: 300 });
    await fireEvent.pointerMove(category, { pointerId: 2, clientX: 1600, clientY: 1300 });

    await waitFor(() => {
      const x = Number(category.getAttribute('transform')?.match(/translate\(([-\d.]+)/)?.[1]);
      expect(x).toBeGreaterThan(1200);
    });

    await fireEvent.click(within(container).getByRole('button', { name: 'reset' }));

    await waitFor(() => {
      const x = Number(category.getAttribute('transform')?.match(/translate\(([-\d.]+)/)?.[1]);
      expect(x).toBeLessThan(900);
    });
  });

  it('searches taxonomy nodes and opens related article details', async () => {
    render(KnowledgeGraphView, { graph });

    const search = screen.getByRole('searchbox', { name: 'Search graph' });
    await fireEvent.input(search, { target: { value: 'wind' } });
    await fireEvent.click(screen.getByRole('button', { name: /Windows, tag, 1 article/i }));

    const details = screen.getByRole('complementary', { name: 'Graph selection' });
    expect(within(details).getByRole('heading', { name: 'Windows' })).toBeInTheDocument();
    expect(within(details).getByRole('link', { name: 'Kernel notes' })).toHaveAttribute(
      'href',
      '/blog/reverse-engineering/kernel-notes'
    );
    expect(within(details).getByRole('link', { name: 'Open tag archive' })).toHaveAttribute(
      'href',
      '/blog/tag/windows'
    );
  });
});
