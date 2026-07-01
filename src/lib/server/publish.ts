/**
 * Helpers for the publish flow: signed preview tokens + on-demand
 * revalidation of public routes.
 *
 * Token shape:
 *   base64url(body_bytes || 0x2e || hmacSha256(SESSION_SECRET, body))
 *   body = `${expSec}.${slug}`
 *
 * Note: the body/sig boundary is found by SIG_BYTES from the end of
 * the raw payload, NOT by scanning for the `.` separator. The sig is
 * 32 random bytes and ~12% of them will contain 0x2e ('.') somewhere,
 * which would otherwise fool a delimiter-based split.
 *
 * Revalidation is currently a logging stub: Vercel's adapter does not
 * expose a stable on-demand API for SvelteKit routes, and the public
 * pages already carry short `s-maxage` TTLs so drift stays bounded.
 */

import { createHmac } from 'node:crypto';
import { encodeBase64url, decodeBase64url } from '@oslojs/encoding';

const TE = new TextEncoder();
const TD = new TextDecoder();

/** HMAC-SHA256 output length. */
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

/** Build a preview token. `ttlSec` defaults to 24 h. */
export function signPreviewToken(slug: string, ttlSec = 60 * 60 * 24): string {
  const expSec = Math.floor(Date.now() / 1000) + ttlSec;
  const body   = TE.encode(`${expSec}.${slug}`);
  const sig    = signBytes(body);

  const buf = new Uint8Array(body.length + 1 + sig.length);
  buf.set(body, 0);
  buf[body.length] = 0x2e; // '.' separator — purely cosmetic for symmetry.
  buf.set(sig, body.length + 1);
  return encodeBase64url(buf);
}

export function verifyPreviewToken(token: string, slug: string): boolean {
  let raw: Uint8Array;
  try { raw = decodeBase64url(token); } catch { return false; }
  if (raw.length <= SIG_BYTES + 1) return false;

  // Split by fixed offset from the end. Do NOT scan for '.' — the sig
  // is random bytes and can legitimately contain 0x2e, which would
  // confuse a delimiter-based parser ~12% of the time.
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

/**
 * Logging stub. Replace with an HTTP call once Vercel exposes a stable
 * on-demand revalidation API for adapter-vercel routes.
 */
export async function revalidatePaths(paths: string[]): Promise<void> {
  // eslint-disable-next-line no-console
  console.log('[revalidate]', paths.join(', '));
}
