import { describe, expect, it } from 'vitest';
import {
  buildKnowledgeGraph,
  getVisibleKnowledgeGraph,
  type KnowledgeGraphRow
} from '$lib/knowledge/graph';

const rows: KnowledgeGraphRow[] = [
  {
    postId: 'post-1',
    postSlug: 'kernel-notes',
    postTitle: 'Kernel notes',
    categorySlug: 'reverse-engineering',
    categoryLabel: 'Reverse engineering',
    categoryIcon: 'bug',
    tagSlug: 'windows',
    tagLabel: 'Windows'
  },
  {
    postId: 'post-1',
    postSlug: 'kernel-notes',
    postTitle: 'Kernel notes',
    categorySlug: 'reverse-engineering',
    categoryLabel: 'Reverse engineering',
    categoryIcon: 'bug',
    tagSlug: 'internals',
    tagLabel: 'Internals'
  },
  {
    postId: 'post-2',
    postSlug: 'driver-boundaries',
    postTitle: 'Driver boundaries',
    categorySlug: 'reverse-engineering',
    categoryLabel: 'Reverse engineering',
    categoryIcon: 'bug',
    tagSlug: 'windows',
    tagLabel: 'Windows'
  },
  {
    postId: 'post-3',
    postSlug: 'browser-sandboxes',
    postTitle: 'Browser sandboxes',
    categorySlug: 'web-security',
    categoryLabel: 'Web security',
    categoryIcon: 'shield',
    tagSlug: 'windows',
    tagLabel: 'Windows'
  }
];

describe('knowledge graph model', () => {
  it('aggregates duplicate join rows into weighted taxonomy links', () => {
    const graph = buildKnowledgeGraph(rows);

    expect(graph.taxonomyNodes).toEqual(expect.arrayContaining([
      expect.objectContaining({
        id: 'category:reverse-engineering',
        postCount: 2,
        href: '/blog?category=reverse%20engineering'
      }),
      expect.objectContaining({ id: 'category:web-security', postCount: 1 }),
      expect.objectContaining({ id: 'tag:windows', postCount: 3 }),
      expect.objectContaining({ id: 'tag:internals', postCount: 1 })
    ]));
    expect(graph.taxonomyLinks).toEqual(expect.arrayContaining([
      expect.objectContaining({
        source: 'category:reverse-engineering',
        target: 'tag:windows',
        weight: 2
      }),
      expect.objectContaining({
        source: 'category:web-security',
        target: 'tag:windows',
        weight: 1
      })
    ]));
    expect(graph.articleNodes).toHaveLength(3);
  });

  it('adds only articles related to the selected taxonomy node', () => {
    const graph = buildKnowledgeGraph(rows);
    const visible = getVisibleKnowledgeGraph(graph, 'tag:internals');

    expect(visible.nodes.filter((node) => node.type === 'article')).toEqual([
      expect.objectContaining({ id: 'article:post-1', title: 'Kernel notes' })
    ]);
    expect(visible.links).toEqual(expect.arrayContaining([
      expect.objectContaining({
        source: 'article:post-1',
        target: 'tag:internals',
        kind: 'article'
      }),
      expect.objectContaining({
        source: 'article:post-1',
        target: 'category:reverse-engineering',
        kind: 'article'
      })
    ]));
    expect(visible.nodes.some((node) => node.id === 'article:post-2')).toBe(false);
  });

  it('caps the visible graph while keeping the selected node', () => {
    const largeGraph = buildKnowledgeGraph(Array.from({ length: 160 }, (_, index) => ({
      postId: `post-${index}`,
      postSlug: `post-${index}`,
      postTitle: `Post ${index}`,
      categorySlug: 'research',
      categoryLabel: 'Research',
      categoryIcon: 'search',
      tagSlug: `tag-${index}`,
      tagLabel: `Tag ${index}`
    })));

    const visible = getVisibleKnowledgeGraph(largeGraph, 'tag:tag-159');

    expect(visible.nodes.length).toBeLessThanOrEqual(150);
    expect(visible.nodes.some((node) => node.id === 'tag:tag-159')).toBe(true);
  });

  it('keeps a searched article visible when its category has many posts', () => {
    const largeGraph = buildKnowledgeGraph(Array.from({ length: 60 }, (_, index) => ({
      postId: `post-${index}`,
      postSlug: `post-${index}`,
      postTitle: `Post ${String(index).padStart(2, '0')}`,
      categorySlug: 'research',
      categoryLabel: 'Research',
      categoryIcon: 'search',
      tagSlug: null,
      tagLabel: null
    })));

    const visible = getVisibleKnowledgeGraph(
      largeGraph,
      'category:research',
      'article:post-59'
    );

    expect(visible.nodes.some((node) => node.id === 'article:post-59')).toBe(true);
  });
});
