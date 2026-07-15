export type PageKey = 'home' | 'blog' | 'about' | 'article' | 'admin';

export function pageKey(pathname: string): PageKey {
  if (pathname === '/' || pathname === '') return 'home';
  if (pathname.startsWith('/admin')) return 'admin';

  const segments = pathname.split('/').filter(Boolean);
  if (segments[0] === 'blog') return segments.length >= 3 ? 'article' : 'blog';
  if (pathname.startsWith('/about')) return 'about';
  return 'home';
}
