import type { CategoryIconName } from '$lib/icons/icon-names';

export interface KnowledgeGraphRow {
  postId: string;
  postSlug: string;
  postTitle: string;
  categorySlug: string;
  categoryLabel: string;
  categoryIcon: CategoryIconName;
  tagSlug: string | null;
  tagLabel: string | null;
}

export interface KnowledgeGraphNode {
  id: string;
  type: 'category' | 'tag' | 'article';
  slug: string;
  label: string;
  title: string;
  href: string;
  icon: CategoryIconName;
  postCount: number;
}

export interface KnowledgeGraphLink {
  id: string;
  source: string;
  target: string;
  kind: 'taxonomy' | 'article';
  weight: number;
}

export interface KnowledgeGraphModel {
  taxonomyNodes: KnowledgeGraphNode[];
  taxonomyLinks: KnowledgeGraphLink[];
  articleNodes: KnowledgeGraphNode[];
  articleLinks: KnowledgeGraphLink[];
  articleIdsByTaxonomy: Record<string, string[]>;
}

export interface VisibleKnowledgeGraph {
  nodes: KnowledgeGraphNode[];
  links: KnowledgeGraphLink[];
}

export const MAX_VISIBLE_GRAPH_NODES = 150;
const MAX_EXPANDED_ARTICLES = 48;

function categoryId(slug: string): string {
  return `category:${slug}`;
}

function tagId(slug: string): string {
  return `tag:${slug}`;
}

function articleId(postId: string): string {
  return `article:${postId}`;
}

function addToSet(map: Map<string, Set<string>>, key: string, value: string): void {
  const values = map.get(key);
  if (values) values.add(value);
  else map.set(key, new Set([value]));
}

function graphLink(
  source: string,
  target: string,
  kind: KnowledgeGraphLink['kind'],
  weight = 1
): KnowledgeGraphLink {
  return { id: `${kind}:${source}:${target}`, source, target, kind, weight };
}

export function buildKnowledgeGraph(rows: KnowledgeGraphRow[]): KnowledgeGraphModel {
  const taxonomyNodes = new Map<string, KnowledgeGraphNode>();
  const taxonomyPosts = new Map<string, Set<string>>();
  const taxonomyLinkPosts = new Map<string, Set<string>>();
  const articleNodes = new Map<string, KnowledgeGraphNode>();
  const articleLinks = new Map<string, KnowledgeGraphLink>();
  const articleIdsByTaxonomy = new Map<string, Set<string>>();

  for (const row of rows) {
    const categoryNodeId = categoryId(row.categorySlug);
    const postNodeId = articleId(row.postId);

    taxonomyNodes.set(categoryNodeId, {
      id: categoryNodeId,
      type: 'category',
      slug: row.categorySlug,
      label: row.categoryLabel,
      title: row.categoryLabel,
      href: `/blog?category=${encodeURIComponent(row.categoryLabel.trim().toLowerCase())}`,
      icon: row.categoryIcon,
      postCount: 0
    });
    addToSet(taxonomyPosts, categoryNodeId, row.postId);

    articleNodes.set(postNodeId, {
      id: postNodeId,
      type: 'article',
      slug: row.postSlug,
      label: row.postTitle,
      title: row.postTitle,
      href: `/blog/${encodeURIComponent(row.categorySlug)}/${encodeURIComponent(row.postSlug)}`,
      icon: 'article',
      postCount: 1
    });
    addToSet(articleIdsByTaxonomy, categoryNodeId, postNodeId);
    const categoryArticleLink = graphLink(postNodeId, categoryNodeId, 'article');
    articleLinks.set(categoryArticleLink.id, categoryArticleLink);

    if (!row.tagSlug || !row.tagLabel) continue;

    const tagNodeId = tagId(row.tagSlug);
    taxonomyNodes.set(tagNodeId, {
      id: tagNodeId,
      type: 'tag',
      slug: row.tagSlug,
      label: row.tagLabel,
      title: row.tagLabel,
      href: `/blog/tag/${encodeURIComponent(row.tagSlug)}`,
      icon: 'share',
      postCount: 0
    });
    addToSet(taxonomyPosts, tagNodeId, row.postId);
    addToSet(taxonomyLinkPosts, `${categoryNodeId}:${tagNodeId}`, row.postId);
    addToSet(articleIdsByTaxonomy, tagNodeId, postNodeId);
    const tagArticleLink = graphLink(postNodeId, tagNodeId, 'article');
    articleLinks.set(tagArticleLink.id, tagArticleLink);
  }

  for (const [id, node] of taxonomyNodes) {
    node.postCount = taxonomyPosts.get(id)?.size ?? 0;
  }

  return {
    taxonomyNodes: [...taxonomyNodes.values()].sort((a, b) =>
      a.type.localeCompare(b.type) || a.label.localeCompare(b.label)
    ),
    taxonomyLinks: [...taxonomyLinkPosts.entries()].map(([key, postIds]) => {
      const separator = key.indexOf(':tag:');
      const source = key.slice(0, separator);
      const target = key.slice(separator + 1);
      return graphLink(source, target, 'taxonomy', postIds.size);
    }),
    articleNodes: [...articleNodes.values()].sort((a, b) => a.title.localeCompare(b.title)),
    articleLinks: [...articleLinks.values()],
    articleIdsByTaxonomy: Object.fromEntries(
      [...articleIdsByTaxonomy.entries()].map(([id, articleIds]) => [id, [...articleIds]])
    )
  };
}

export function getVisibleKnowledgeGraph(
  graph: KnowledgeGraphModel,
  selectedId: string | null,
  focusedId: string | null = null
): VisibleKnowledgeGraph {
  const articleIds = new Set(selectedId ? graph.articleIdsByTaxonomy[selectedId] ?? [] : []);
  // ponytail: show the first 48 related articles; add paging when the archive exceeds this ceiling.
  const articleNodes = graph.articleNodes
    .filter((node) => articleIds.has(node.id))
    .sort((a, b) => Number(b.id === focusedId) - Number(a.id === focusedId)
      || a.title.localeCompare(b.title))
    .slice(0, MAX_EXPANDED_ARTICLES);
  const taxonomyLimit = MAX_VISIBLE_GRAPH_NODES - articleNodes.length;
  const taxonomyNodes = [...graph.taxonomyNodes]
    .sort((a, b) =>
      Number(b.id === selectedId) - Number(a.id === selectedId)
      || Number(b.type === 'category') - Number(a.type === 'category')
      || b.postCount - a.postCount
      || a.label.localeCompare(b.label)
    )
    .slice(0, taxonomyLimit);
  const nodes = [...taxonomyNodes, ...articleNodes];
  const visibleIds = new Set(nodes.map((node) => node.id));
  const links = [...graph.taxonomyLinks, ...graph.articleLinks]
    .filter((link) => visibleIds.has(link.source) && visibleIds.has(link.target));

  return { nodes, links };
}
