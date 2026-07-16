import { entryGroups } from '../../src/lib/data/entries.js';
import { article } from '../../src/lib/data/article.js';
import { blocksToTiptap } from '../../src/lib/editor/blocks-to-tiptap';
import { renderPost } from '../../src/lib/server/render-post';
import { parseEntryDate, slugify } from '../../src/lib/util/strings';

export const FULL_ARTICLE_SLUG = 'vmprotect-3x-devirt';

const TONE_BY_CATEGORY: Record<string, string> = {
  Reverse: 'crimson-deep',
  Windows: 'steel',
  ML: 'rose',
  Web: 'crimson',
  'Anti-cheat': 'muted-warm'
};

const ICON_BY_CATEGORY: Record<string, string> = {
  Reverse: 'debug',
  Windows: 'app-windows',
  ML: 'ai-scan',
  Web: 'globe',
  'Anti-cheat': 'shield'
};

type TitleParts = { pre?: string; em?: string; post?: string };

export interface SeededPost {
  slug: string;
  titlePre: string;
  titleEm: string;
  titlePost: string;
  dek: string;
  category: string;
  status: 'published' | 'draft';
  publishedAt: Date | null;
  docJson: unknown;
  bodyHtml: string;
  footnotesJson: unknown;
  seoTitle: string;
  seoDescription: string;
  canonicalUrl: string | null;
  socialImageUrl: string | null;
  socialImageAlt: string | null;
  noIndex: boolean;
}

export interface SeededCategory {
  slug: string;
  label: string;
  icon: string;
  tone: string;
}

export interface SeedPlan {
  categories: SeededCategory[];
  posts: SeededPost[];
}

export function splitTitle(title: string | TitleParts): { pre: string; em: string; post: string } {
  if (typeof title !== 'string') {
    return {
      pre: title.pre ?? '',
      em: title.em ?? '',
      post: title.post ?? ''
    };
  }

  const input = title;
  const tokens = [...input.matchAll(/\b[\w.-]+\b/g)];
  const start = tokens.findIndex((token) => {
    const word = token[0];
    return /[0-9.]/.test(word) || /[A-Z]{2,}/.test(word) || (word.includes('-') && /[A-Z]/.test(word));
  });

  if (start !== -1) {
    let end = start;
    while (end + 1 < tokens.length) {
      const next = tokens[end + 1][0];
      if (!(/[0-9.]/.test(next) || /^[A-Z][\w.-]*$/.test(next))) break;
      end += 1;
      if (end - start >= 1) break;
    }

    const first = tokens[start];
    const last = tokens[end];
    const from = first.index ?? 0;
    const to = (last.index ?? from) + last[0].length;

    return {
      pre: input.slice(0, from),
      em: input.slice(from, to),
      post: input.slice(to)
    };
  }

  return { pre: input, em: '', post: '' };
}

export function uniqueCategories(posts: SeededPost[]): SeededCategory[] {
  const seen = new Map<string, SeededCategory>();

  for (const post of posts) {
    const key = post.category.toLowerCase();
    if (seen.has(key)) continue;

    seen.set(key, {
      slug: slugify(post.category),
      label: post.category,
      icon: ICON_BY_CATEGORY[post.category] ?? 'book-open',
      tone: TONE_BY_CATEGORY[post.category] ?? 'crimson-deep'
    });
  }

  return [...seen.values()];
}

export async function buildSeedPlan(): Promise<SeedPlan> {
  const out: SeededPost[] = [];

  for (const group of entryGroups) {
    for (const entry of group.entries) {
      const title = splitTitle(entry.title);
      const publishedAt = parseEntryDate(entry.date, group.year);
      const slug = entry.title.toLowerCase().includes('devirtualizing vmprotect')
        ? FULL_ARTICLE_SLUG
        : slugify(entry.title);

      out.push({
        slug,
        titlePre: title.pre,
        titleEm: title.em,
        titlePost: title.post,
        dek: entry.desc,
        category: entry.category,
        status: 'published',
        publishedAt,
        docJson: { type: 'doc', content: [] },
        bodyHtml: '',
        footnotesJson: [],
        seoTitle: entry.title,
        seoDescription: entry.desc,
        canonicalUrl: null,
        socialImageUrl: null,
        socialImageAlt: null,
        noIndex: false
      });
    }
  }

  const fullDoc = blocksToTiptap(article.body as any);
  const { bodyHtml } = await renderPost(fullDoc);
  const fullPost: SeededPost = {
    slug: FULL_ARTICLE_SLUG,
    titlePre: article.head.title.pre,
    titleEm: article.head.title.em,
    titlePost: article.head.title.post,
    dek: article.head.dek,
    category: article.head.category.replace(/ engineering$/i, '').trim() || article.head.category,
    status: 'published',
    publishedAt: parseEntryDate('Mar 14', 2026),
    docJson: fullDoc,
    bodyHtml,
    footnotesJson: article.footnotes ?? [],
    seoTitle: `${article.head.title.pre}${article.head.title.em}${article.head.title.post}`,
    seoDescription: article.head.dek,
    canonicalUrl: null,
    socialImageUrl: null,
    socialImageAlt: null,
    noIndex: false
  };

  const fullIndex = out.findIndex((post) => post.slug === FULL_ARTICLE_SLUG);
  if (fullIndex === -1) out.unshift(fullPost);
  else out[fullIndex] = fullPost;

  const categories = uniqueCategories(out);
  const categorySlugs = new Map(categories.map((category) => [category.label, category.slug]));
  const posts = out.map((post) => ({
    ...post,
    category: categorySlugs.get(post.category) ?? slugify(post.category)
  }));

  return { categories, posts };
}
