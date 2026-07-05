export type PageKey = 'home' | 'blog' | 'about' | 'article' | 'admin';

export function pageKey(pathname: string): PageKey {
  if (pathname === '/' || pathname === '') return 'home';
  if (pathname.startsWith('/admin'))   return 'admin';
  if (pathname.startsWith('/blog'))    return 'blog';
  if (pathname.startsWith('/about'))   return 'about';
  if (pathname.startsWith('/article')) return 'article';
  return 'home';
}
