import { uploadDocument, uploadMedia } from '@/shared/services/media';

type ListingMediaInput = {
  id: string;
  uri: string;
  kind: string;
  name?: string;
  key?: string;
};

function isRemoteUri(uri: string): boolean {
  return uri.startsWith('http://') || uri.startsWith('https://');
}

function imageContentType(uri: string): 'image/jpeg' | 'image/png' | 'image/webp' {
  const lower = uri.toLowerCase();
  if (lower.includes('.png')) return 'image/png';
  if (lower.includes('.webp')) return 'image/webp';
  return 'image/jpeg';
}

/** Uploads local photos/PDFs so listing records persist public URLs instead of device file URIs. */
export async function persistListingMedia<T extends ListingMediaInput>(media: T[]): Promise<T[]> {
  return Promise.all(
    media.map(async (item) => {
      if (item.kind === 'document') {
        if (item.key && isRemoteUri(item.uri)) return item;
        const uploaded = await uploadDocument({ uri: item.uri, contentType: 'application/pdf' });
        return { ...item, uri: uploaded.url, key: uploaded.key } as T;
      }

      if (item.kind !== 'photo' || isRemoteUri(item.uri)) {
        return item;
      }

      const uploaded = await uploadMedia({
        uri: item.uri,
        contentType: imageContentType(item.uri),
      });
      return { ...item, uri: uploaded.url, key: uploaded.key } as T;
    }),
  );
}
