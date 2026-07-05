const TEXT_MAP: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;' };
const ATTR_MAP: Record<string, string> = { ...TEXT_MAP, '"': '&quot;' };

export function escapeHtml(s: string): string {
  return s.replace(/[&<>]/g, (c) => TEXT_MAP[c]);
}

export function escapeAttr(s: string): string {
  return s.replace(/[&<>"]/g, (c) => ATTR_MAP[c]);
}
