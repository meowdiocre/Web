/**
 * Guards the server-side syntax highlighter against silent regressions.
 *
 * The render-post pipeline relies on Shiki emitting TextMate scopes
 * (`includeExplanation: 'scopeName'`) so `classFor()` can bucket tokens
 * into the `kw|fn|str|com|num` classes the public CSS styles. If Shiki's
 * options drift, the output reverts to bare escaped text and articles
 * render colourless — which is exactly the regression these tests catch.
 */

import { describe, expect, it } from 'vitest';
import { highlightToClasses } from '$lib/server/shiki-to-classes';
import { renderPost } from '$lib/server/render-post';
import type { Doc } from '$lib/editor/types';

describe('highlightToClasses', () => {
  it('emits kw/fn/str/com class spans for javascript', async () => {
    const html = await highlightToClasses(
      "// hi\nimport { x } from 'mod';\nfunction hello() { return 'world'; }",
      'javascript'
    );
    expect(html).toContain('class="com"');
    expect(html).toContain('class="kw"');
    expect(html).toContain('class="str"');
    // function name should bucket into fn
    expect(html).toContain('class="fn"');
  });

  it('accepts the js alias via render-post (codeBlock.lang = "js")', async () => {
    const doc: Doc = {
      type: 'doc',
      content: [
        { type: 'codeBlock', attrs: {
            source: "const n = 1;\n// hi",
            // intentionally an alias the dialog could emit
            lang:   'javascript',
            caption: 'js demo',
            html:   ''
        } }
      ]
    };
    const { bodyHtml } = await renderPost(doc);
    expect(bodyHtml).toContain('<pre><code>');
    expect(bodyHtml).toContain('class="kw"');  // const
    expect(bodyHtml).toContain('class="com"'); // // hi
    expect(bodyHtml).toContain('<span class="figure-cap">js demo</span>');
  });

  it('passes plaintext through unspanned', async () => {
    const html = await highlightToClasses('plain old text', 'plaintext');
    expect(html).toBe('plain old text');
    expect(html).not.toContain('<span');
  });

  it('escapes html in plaintext source', async () => {
    const html = await highlightToClasses('<script>x</script>', 'plaintext');
    expect(html).toBe('&lt;script&gt;x&lt;/script&gt;');
  });
});
