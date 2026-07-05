import { db } from './client';
import { media } from './schema';
import { asInsert } from './write';

export interface MediaInsert {
  url:        string;
  pathname:   string;
  mime:       string;
  bytes:      number;
  width?:     number | null;
  height?:    number | null;
  uploadedBy: string | null;
}

export interface MediaRecord {
  id:       string;
  url:      string;
  pathname: string;
  mime:     string;
  bytes:    number;
}

export async function createMedia(input: MediaInsert): Promise<MediaRecord> {
  const values = {
    url:        input.url,
    pathname:   input.pathname,
    mime:       input.mime,
    bytes:      input.bytes,
    width:      input.width ?? null,
    height:     input.height ?? null,
    uploadedBy: input.uploadedBy
  };

  const [row] = await db
    .insert(media)
    .values(asInsert(values))
    .returning({
      id:       media.id,
      url:      media.url,
      pathname: media.pathname,
      mime:     media.mime,
      bytes:    media.bytes
    });

  return row;
}
