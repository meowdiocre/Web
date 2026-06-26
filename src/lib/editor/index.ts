/**
 * Editor factory used by /admin/posts/[id]/edit. Loads TipTap + all
 * extensions and returns a ready-to-mount Editor instance. Browser-only
 * by construction (TipTap touches `window`).
 */

import { Editor } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import Link       from '@tiptap/extension-link';
import Image      from '@tiptap/extension-image';

// Custom Tiptap command typings live next to this file in
// `commands.d.ts`. They augment the `Commands<ReturnType>` interface
// from @tiptap/core via a `declare module` block; TypeScript picks
// them up automatically — no runtime import needed (and indeed, .d.ts
// files have no runtime form, so importing them would break Vite).

import { PullQuote }   from './extensions/pull-quote';
import { CodeBlock as CustomCodeBlock } from './extensions/code-block';
import { Sidenote }    from './extensions/sidenote';
import { EndSlug }     from './extensions/end-slug';
import { ImageUpload, type ImageUploadStatus } from './extensions/image-upload';

import type { Doc } from './types';

export type { ImageUploadStatus };

export interface CreateEditorArgs {
  /** DOM element to mount into. */
  element:  HTMLElement;
  /** Initial document content. */
  content?: Doc;
  /** Fired whenever the user edits. */
  onUpdate?: (doc: Doc) => void;
  /** Fired when the editor regains focus. */
  onFocus?: () => void;
  /** Drag/drop/paste image upload progress. */
  onImageStatus?: (status: ImageUploadStatus) => void;
}

export function createEditor({
  element,
  content,
  onUpdate,
  onFocus,
  onImageStatus
}: CreateEditorArgs): Editor {
  return new Editor({
    element,
    extensions: [
      StarterKit.configure({
        codeBlock: false, // replaced by our custom one
        heading:  { levels: [2, 3] }
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { rel: 'noopener noreferrer' }
      }),
      Image.configure({
        HTMLAttributes: { class: 'essay-image-img', loading: 'lazy' }
      }),
      PullQuote,
      CustomCodeBlock,
      Sidenote,
      EndSlug,
      ImageUpload.configure({ onStatus: onImageStatus })
    ],
    content: content ?? { type: 'doc', content: [{ type: 'paragraph' }] },
    autofocus: 'end',
    onUpdate({ editor }) {
      onUpdate?.(editor.getJSON() as Doc);
    },
    onFocus() { onFocus?.(); },
    editorProps: {
      attributes: {
        class: 'essay__inner outline-none',
        spellcheck: 'true',
        'data-test': 'editor'
      }
    }
  });
}
