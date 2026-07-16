export function articlePath(category: string, slug: string): string {
  return `/blog/${encodeURIComponent(category)}/${encodeURIComponent(slug)}`;
}

export function tagPath(slug: string): string {
  return `/blog/tag/${encodeURIComponent(slug)}`;
}
