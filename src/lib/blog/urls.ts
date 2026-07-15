export function articlePath(category: string, slug: string): string {
  return `/blog/${encodeURIComponent(category)}/${encodeURIComponent(slug)}`;
}
