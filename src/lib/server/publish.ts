/**
 * Helpers for the publish flow: signed preview tokens + on-demand
 * revalidation of the public routes.
 *
 * Preview tokens:
 *   token = base64url(`${expSec}.${slug}.${hmacSha256(secret, "${expSec}.${slug}")}`)
 *   verifyPreviewToken(token, slug) returns true iff exp > now and hmac valid.
 *
 * Revalidation:
 *   revalidatePaths(['/blog', '/article/foo', '/feed.xml']) currently
 *   relies on the public routes' `s-maxage` Cache-Control headers (5-10
 *   min). Vercel does not expose a stable on-demand API for adapter-
 *   vercel SvelteKit routes; the short TTL keeps drift bounded and the
 *   admin UI shows the active value so authors know what to expect.
 */

import { createHmac } from 'node:crypto';
import { encodeBase64url, decodeBase64url } from '@oslojs/encoding';

const TE = new TextEncoder();
const TD = new TextDecoder();

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

/** Build a preview token. ttlSec defaults to 24h. */
export function signPreviewToken(slug: string, ttlSec = 60 * 60 * 24): string {
  const expSec = Math.floor(Date.now() / 1000) + ttlSec;
  const body   = `${expSec}.${slug}`;
  const sig    = signBytes(TE.encode(body));
  // Combine body + sig into a single base64url string.
  const buf = new Uint8Array(TE.encode(body).length + 1 + sig.length);
  buf.set(TE.encode(body), 0);
  buf[TE.encode(body).length] = 0x2e; // '.'
  buf.set(sig, TE.encode(body).length + 1);
  return encodeBase64url(buf);
}

export function verifyPreviewToken(token: string, slug: string): boolean {
  let raw: Uint8Array;
  try { raw = decodeBase64url(token); } catch { return false; }
  const txt = TD.decode(raw);
  const lastDot = txt.lastIndexOf('.');
  if (lastDot === -1) return false;
  const body    = txt.slice(0, lastDot);
  const sigStr  = txt.slice(lastDot + 1);
  // Re-compute hmac on body and compare.
  const expected = signBytes(TE.encode(body));
  // Compare as bytes: sigStr is the trailing portion of raw, take bytes after the same offset.
  const sigBytes = raw.slice(TE.encode(body).length + 1);
  if (sigBytes.length !== expected.length) return false;
  let diff = 0;
  for (let i = 0; i < expected.length; i++) diff |= expected[i] ^ sigBytes[i];
  if (diff !== 0) return false;
  // Validate body shape.
  const [expStr, parsedSlug] = body.split('.');
  if (!expStr || parsedSlug !== slug) return false;
  const expSec = parseInt(expStr, 10);
  if (!Number.isFinite(expSec)) return false;
  return expSec * 1000 > Date.now();
}

/**
 * "Revalidate" a list of public paths. Today this is a no-op stub that
 * logs; once Vercel exposes a stable on-demand revalidation API for
 * adapter-vercel routes, this becomes an HTTP call. Public pages already
 * carry short s-maxage TTLs so changes land within minutes regardless.
 */
export async function revalidatePaths(paths: string[]): Promise<void> {
  // eslint-disable-next-line no-console
  console.log('[revalidate]', paths.join(', '));
}
