# Post Thumbnails Design

## Goal

Add optional post thumbnails from admin upload through public rendering.

## Admin workflow

Create a reusable `ThumbnailField.svelte` component for post metadata. It provides:

- A native file input for JPEG, PNG, WebP, and AVIF files.
- A manual URL input for existing external images.
- Upload, replace, preview, and remove actions.
- Clear uploading and error states.
- A submitted `coverImageUrl` field that keeps the existing metadata action unchanged.

The component uploads through the existing `/admin/api/media` endpoint and stores the returned public URL. Thumbnail upload remains optional.

## Upload validation

Add a `purpose=thumbnail` form value to thumbnail uploads. The media endpoint keeps the existing editor-image behavior when the purpose is absent.

Thumbnail uploads accept only JPEG, PNG, WebP, and AVIF. Reject SVG and GIF thumbnails because animation and arbitrary vector dimensions produce inconsistent cards. Limit thumbnails to 4 MiB. Keep the existing 8 MiB limit and type set for editor images.

Validation stays on the server trust boundary. Client `accept` and size checks provide faster feedback but do not replace server validation.

## Public data

Add `coverImageUrl` to:

- `PublicEntry`
- `PublicArticle.head`
- `RelatedEntry`

Select the existing `posts.coverImageUrl` value in public entry, article, and related queries. No database migration is required.

## Public rendering

Create a reusable `PostThumbnail.svelte` component with list, related, and hero variants.

- Use a 16:9 container and `object-fit: cover`.
- Use lazy loading and async decoding for list and related images.
- Load the article hero eagerly with high fetch priority.
- Use empty alt text because each image appears beside the same post title.
- Render nothing when no thumbnail URL exists. Existing no-image layouts remain intact.

Blog entries place the thumbnail at the right on wider screens and above the text on narrow screens. Related cards place it above card copy. The article page places the hero between the dek and metadata.

## Errors and fallback

If an image fails to load, hide its broken visual container and preserve the text layout. Upload failures remain local to the field and do not clear the previously saved URL.

## Testing

- Test thumbnail upload validation separately from editor-image validation.
- Test admin upload, preview, replace, remove, and error states.
- Test public components with and without thumbnail URLs.
- Test public query shapes and article rendering props.
- Run `npm run check`, focused tests, `npm run build`, `npm run test`, and `npm run test:e2e`.
