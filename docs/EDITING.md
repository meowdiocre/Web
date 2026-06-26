# Editing a post

The TipTap canvas at `/admin/posts/[id]/edit` renders inside a
`data-page="article"` shell so every CSS variable, font, and selector
that styles the public `/article/[slug]` page applies in the editor
unchanged. There is no "preview" mode — the editor IS the preview.

## Block kinds

| Block       | Shortcut         | Toolbar       | Editor look                    | Public render                                                                              |
| ----------- | ---------------- | ------------- | ------------------------------ | ------------------------------------------------------------------------------------------ |
| Paragraph   | (default)        |               | Source Serif, 1.78 leading     | Same. First paragraph gets the Archivo-Black drop cap automatically.                       |
| Heading 2   | `Ctrl-Alt-2`     | `H2`          | Archivo Black uppercase        | Same, with a top hairline rule.                                                            |
| Heading 3   | `Ctrl-Alt-3`     | `H3`          | Archivo Black uppercase        | Same.                                                                                      |
| Bold        | `Ctrl-B`         | `B`           | Bold inline                    | `<strong>`.                                                                                |
| Italic      | `Ctrl-I`         | `i`           | Italic inline                  | `<em>`.                                                                                    |
| Inline code | `Ctrl-E`         | `‹/›`         | Mono on cream chip             | `<code>`.                                                                                  |
| Bullet list | `Ctrl-Shift-8`   | `•`           | Bulleted                       | `<ul>`.                                                                                    |
| Ordered list| `Ctrl-Shift-7`   | `1.`          | Numbered                       | `<ol>`.                                                                                    |
| Link        |                  | `link`        | Underlined crimson             | `<a rel="noopener noreferrer">`.                                                           |
| Pull quote  | `Ctrl-Shift-Q`   | `pull-quote` | Centered italic, guillemets    | `<blockquote class="pull">`.                                                               |
| Code block  | `Ctrl-Shift-K`   | `code`        | Mono pre with caption          | `<pre><code>…syntax-highlighted…</code></pre><span class="figure-cap">…</span>`.           |
| Sidenote    | `Ctrl-Shift-S`   | `sidenote`   | Inline crimson chip            | Twin span: `<span class="sidenote-ref">¹</span><span class="sidenote">¹ body…</span>` that floats to the right margin on the public page. |
| End slug    |                  | `end-slug`   | `∅ · text · text`              | Same. Place once at the very end of the post.                                              |
| Image       | drag / paste     |               | Inline                         | `<figure class="essay-image"><img loading="lazy" />`.                                       |

## Code blocks

When you insert a code block you're prompted for **language** and
**caption**. Supported languages: `asm`, `bash`, `c`, `cpp`, `css`,
`go`, `html`, `javascript`, `json`, `powershell`, `python`, `ruby`,
`rust`, `shellscript`, `sql`, `svelte`, `toml`, `tsx`, `typescript`,
`yaml`. Anything else falls back to `plaintext` (no highlighting).

Syntax highlighting is server-side via Shiki on save. The five
spans (`.kw .fn .str .com .num`) match the styles already defined in
`src/lib/components/article/Essay.svelte` and `CodeBlock.svelte`.

The seeded VMProtect post is set to `lang = "plaintext"` so the
hand-curated highlight from the original demo is preserved. If you
edit it and pick a real language, Shiki will re-highlight from the
source you give it.

## Sidenotes

A sidenote stores `{ ref, bodyHtml }`. The `ref` is the visible
character (`¹`, `²`, `³`, ⋯); the body is HTML, so `<em>`, `<strong>`,
`<code>`, and `<a>` all work inside it. In the editor the body shows
as a tooltip on a small chip; on the public page the full footnote
floats to the right margin above 1100 px and collapses to a card
below.

## Sidenote, pull-quote, end-slug authoring shortcut

Hit the toolbar button and answer the prompt. The Task 12 polish
ships these as inline popovers; for now `prompt()` is the v1 UX.

## Save / publish / preview

- **Autosave** fires 3 s after the last keystroke. `Ctrl/Cmd-S`
  saves immediately. The header shows `unsaved` / `saving…` / `saved 14:31:02`.
- **Publish** lives on the metadata page (`/admin/posts/[id]`). Use
  it for an immediate publish, or set `publish_at` and let the
  per-minute cron flip the post.
- **Preview link** generates a signed token that's valid for 24 h.
  Anyone with the link can read the draft. The URL is
  `/article/[slug]?preview=<token>` and the public route refuses
  caching for previewed requests (`Cache-Control: private, no-store`).

## Round-trip guarantee

Every block kind round-trips losslessly through
`blocks → TipTap JSON → server render → HTML → reload → TipTap JSON`.
The seed (`scripts/seed.ts`) and the editor share the same
`renderPost()` pipeline; any divergence is a bug.
