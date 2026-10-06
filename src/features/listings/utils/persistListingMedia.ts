import * as FileSystem from 'expo-file-system/legacy';
import { uploadDocument, uploadMedia } from '@/shared/services/media';

const MAX_VIDEO_BYTES = 20 * 1024 * 1024;

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

function videoContentType(uri: string): 'video/mp4' | 'video/quicktime' {
  const lower = uri.toLowerCase();
  if (lower.includes('.mov') || lower.includes('.qt')) return 'video/quicktime';
  return 'video/mp4';
}

/** Uploads local photos/videos/PDFs so listing records persist public URLs instead of device file URIs. */
export async function persistListingMedia<T extends ListingMediaInput>(media: T[]): Promise<T[]> {
  return Promise.all(
    media.map(async (item) => {
      if (item.kind === 'document') {
        if (item.key && isRemoteUri(item.uri)) return item;
        const uploaded = await uploadDocument({ uri: item.uri, contentType: 'application/pdf' });
        return { ...item, uri: uploaded.url, key: uploaded.key } as T;
      }

      if (isRemoteUri(item.uri)) {
        return item;
      }

      if (item.kind === 'video') {
        const info = await FileSystem.getInfoAsync(item.uri);
        if (
          info.exists &&
          'size' in info &&
          typeof info.size === 'number' &&
          info.size > MAX_VIDEO_BYTES
        ) {
          throw new Error('Video must be 20 MB or smaller.');
        }
        const uploaded = await uploadMedia({
          uri: item.uri,
          contentType: videoContentType(item.uri),
        });
        return { ...item, uri: uploaded.url, key: uploaded.key } as T;
      }

      if (item.kind !== 'photo') {
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
