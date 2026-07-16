export type MediaPurpose = 'editor' | 'thumbnail';

export interface UploadFile {
  type: string;
  size: number;
}

export interface UploadError {
  status: 413 | 415;
  message: string;
}

const MIB = 1024 * 1024;
const EDITOR_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/avif',
  'image/gif'
]);
const THUMBNAIL_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/avif']);

export function mediaUploadError(file: UploadFile, purpose: MediaPurpose): UploadError | null {
  const maxBytes = purpose === 'thumbnail' ? 4 * MIB : 8 * MIB;
  const allowed = purpose === 'thumbnail' ? THUMBNAIL_TYPES : EDITOR_TYPES;

  if (file.size > maxBytes) {
    return { status: 413, message: `File too large: ${file.size} > ${maxBytes}.` };
  }
  if (!allowed.has(file.type)) {
    return { status: 415, message: `Unsupported type: ${file.type}.` };
  }
  return null;
}

function startsWith(bytes: Uint8Array, expected: number[]): boolean {
  return expected.every((value, index) => bytes[index] === value);
}

export async function mediaContentError(file: File): Promise<UploadError | null> {
  const bytes = new Uint8Array(await file.slice(0, 32).arrayBuffer());
  const ascii = new TextDecoder().decode(bytes);
  const valid = file.type === 'image/jpeg'
    ? startsWith(bytes, [0xff, 0xd8, 0xff])
    : file.type === 'image/png'
      ? startsWith(bytes, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])
      : file.type === 'image/gif'
        ? ascii.startsWith('GIF87a') || ascii.startsWith('GIF89a')
        : file.type === 'image/webp'
          ? ascii.startsWith('RIFF') && ascii.slice(8, 12) === 'WEBP'
          : file.type === 'image/avif'
            ? ascii.slice(4, 8) === 'ftyp' && /avif|avis/.test(ascii.slice(8))
            : false;

  return valid ? null : { status: 415, message: 'File content does not match its image type.' };
}
