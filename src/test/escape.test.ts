import { describe, expect, it } from 'vitest';

import { escapeHtml, escapeAttr } from '$lib/util/escape';

describe('escapeHtml (text nodes)', () => {
  it('escapes &, <, >', () => {
    expect(escapeHtml('a & b < c > d')).toBe('a &amp; b &lt; c &gt; d');
  });

  it('does NOT escape quotes (text-node contract)', () => {
    expect(escapeHtml('"foo"')).toBe('"foo"');
    expect(escapeHtml("it's")).toBe("it's");
  });

  it('escapes & first so it never double-encodes entity-like input', () => {
    expect(escapeHtml('&lt;')).toBe('&amp;lt;');
  });

  it('returns plain text unchanged', () => {
    expect(escapeHtml('hello world')).toBe('hello world');
  });
});

describe('escapeAttr (attribute values)', () => {
  it('escapes &, <, >, "', () => {
    expect(escapeAttr('a & b < c > "d"')).toBe('a &amp; b &lt; c &gt; &quot;d&quot;');
  });

  it('escapes & first', () => {
    expect(escapeAttr('&quot;')).toBe('&amp;quot;');
  });

  it('is safe inside a double-quoted attribute', () => {
    expect(escapeAttr('"><script>')).not.toContain('"');
  });
});
