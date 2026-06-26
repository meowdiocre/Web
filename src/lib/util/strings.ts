/**
 * Tiny string + date helpers. Kept zero-dep so they can be used from
 * both browser, server, and scripts.
 */

const MONTHS: Record<string, number> = {
  Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5,
  Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11
};

/**
 * Turn a free-form title into a lowercase, hyphenated, URL-safe slug.
 *
 *   slugify("Devirtualizing VMProtect 3.x without a VM.")
 *     => "devirtualizing-vmprotect-3-x-without-a-vm"
 */
export function slugify(input: string): string {
  return input
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/['"`’]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 96);
}

/**
 * Parse a "Mar 14" entry date plus a known year into a UTC Date.
 * Returns the start of that day (00:00 UTC).
 */
export function parseEntryDate(short: string, year: number): Date | null {
  const m = short.trim().match(/^([A-Z][a-z]{2})\s+(\d{1,2})$/);
  if (!m) return null;
  const month = MONTHS[m[1]];
  if (month === undefined) return null;
  const day = parseInt(m[2], 10);
  if (!Number.isFinite(day)) return null;
  return new Date(Date.UTC(year, month, day, 0, 0, 0));
}

/** Format a Date as `YYYY · MM · DD` (matching article.head.meta.date). */
export function formatMetaDate(d: Date): string {
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  return `${y} · ${m} · ${day}`;
}
