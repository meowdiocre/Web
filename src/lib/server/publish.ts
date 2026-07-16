import { createHmac } from 'node:crypto';
import { encodeBase64url, decodeBase64url } from '@oslojs/encoding';
import { articlePath, tagPath } from '$lib/blog/urls';

const TE = new TextEncoder();
const TD = new TextDecoder();

const SIG_BYTES = 32;

function secret(): Uint8Array {
  const s = process.env.SESSION_SECRET;
  if (!s || s.length < 16) {
    throw new Error('SESSION_SECRET is missing or too short for signing.');
  }
  return TE.encode(s);
}

function signBytes(message: Uint8Array): Uint8Array {
  const h = createHmac('sha256', secret());
  h.update(message);
  return new Uint8Array(h.digest());
}

export interface PreviewPayload { slug: string; expSec: number; }

export function signPreviewToken(slug: string, ttlSec = 60 * 60 * 24): string {
  const expSec = Math.floor(Date.now() / 1000) + ttlSec;
  const body   = TE.encode(`${expSec}.${slug}`);
  const sig    = signBytes(body);

  const buf = new Uint8Array(body.length + 1 + sig.length);
  buf.set(body, 0);
  buf[body.length] = 0x2e;
  buf.set(sig, body.length + 1);
  return encodeBase64url(buf);
}

export function verifyPreviewToken(token: string, slug: string): boolean {
  let raw: Uint8Array;
  try { raw = decodeBase64url(token); } catch { return false; }
  if (raw.length <= SIG_BYTES + 1) return false;

  // HMAC bytes can contain '.', so split by fixed signature length.
  const bodyLen  = raw.length - SIG_BYTES - 1;
  const body     = raw.subarray(0, bodyLen);
  const sigBytes = raw.subarray(bodyLen + 1);

  if (raw[bodyLen] !== 0x2e) return false;

  const expected = signBytes(body);
  if (sigBytes.length !== expected.length) return false;
  let diff = 0;
  for (let i = 0; i < expected.length; i++) diff |= expected[i] ^ sigBytes[i];
  if (diff !== 0) return false;

  const text = TD.decode(body);
  const firstDot = text.indexOf('.');
  if (firstDot === -1) return false;
  const expStr     = text.slice(0, firstDot);
  const parsedSlug = text.slice(firstDot + 1);
  if (parsedSlug !== slug) return false;
  const expSec = parseInt(expStr, 10);
  if (!Number.isFinite(expSec)) return false;
  return expSec * 1000 > Date.now();
}

export async function revalidatePaths(paths: string[]): Promise<void> {
  const base = process.env.VERCEL_REVALIDATE_URL;
  if (!base) {
    // eslint-disable-next-line no-console
    console.log('[revalidate] (skipped, no VERCEL_REVALIDATE_URL)', paths.join(', '));
    return;
  }

  await Promise.all(
    paths.map(async (p) => {
      try {
        const res = await fetch(`${base}${p}`, { method: 'GET' });
        if (!res.ok) {
          // eslint-disable-next-line no-console
          console.warn(`[revalidate] ${p} -> ${res.status}`);
        }
      } catch (e) {
        // eslint-disable-next-line no-console
        console.warn(`[revalidate] ${p} failed:`, e instanceof Error ? e.message : e);
      }
    })
  );
}

export interface TaxonomyChange {
  posts: Array<{
    slug: string;
    status: 'draft' | 'published';
    category: string;
    tagSlugs: string[];
    nextSlug?: string;
    nextCategory?: string;
    nextTagSlugs?: string[];
  }>;
}

export function taxonomyRevalidationPaths(change: TaxonomyChange): string[] {
  const paths = new Set(['/blog', '/feed.xml', '/sitemap.xml']);
  for (const post of change.posts) {
    for (const tagSlug of post.tagSlugs) paths.add(tagPath(tagSlug));
    for (const tagSlug of post.nextTagSlugs ?? []) paths.add(tagPath(tagSlug));
    if (post.status !== 'published') continue;
    paths.add(articlePath(post.category, post.slug));
    if (post.nextCategory || post.nextSlug) {
      paths.add(articlePath(post.nextCategory ?? post.category, post.nextSlug ?? post.slug));
    }
  }
  return [...paths].sort();
}

export function revalidateTaxonomyChange(change: TaxonomyChange): Promise<void> {
  return revalidatePaths(taxonomyRevalidationPaths(change));
}
