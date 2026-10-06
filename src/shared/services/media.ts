import * as FileSystem from 'expo-file-system/legacy';
import { env } from '@/shared/config/env';
import { apiFetch } from './api';

export type UploadableContentType =
  'image/jpeg' | 'image/png' | 'image/webp' | 'application/pdf' | 'video/mp4' | 'video/quicktime';

type PresignUploadResult = { uploadUrl: string; key: string; publicUrl: string; expiresIn: number };

/** Builds a directly-accessible URL for an S3 object key stored via mining-api. */
export function resolveMediaUrl(key: string | null | undefined): string | null {
  if (!key?.trim()) return null;
  const base = env.s3PublicBaseUrl;
  if (!base) return null;
  return `${base.replace(/\/$/, '')}/${key.replace(/^\//, '')}`;
}

async function presignUpload(
  contentType: UploadableContentType,
  contentLength: number,
): Promise<PresignUploadResult> {
  return apiFetch('/uploads/presign', {
    method: 'POST',
    body: { contentType, contentLength },
  });
}

async function localFileSize(uri: string): Promise<number> {
  const info = await FileSystem.getInfoAsync(uri);
  if (!info.exists || typeof info.size !== 'number' || info.size <= 0) {
    throw new Error('Could not determine file size for upload');
  }
  return info.size;
}

/**
 * Uploads a local file (e.g. from expo-image-picker) directly to S3 via a
 * presigned PUT, then returns the object key (to store on whatever backend
 * record it belongs to) and the public URL mining-api computed for it.
 *
 * Uses expo-file-system's native upload rather than fetch().blob() — RN's
 * fetch/Blob polyfill round-trips binary data through base64, which can
 * silently corrupt the bytes (S3 accepts the PUT, but the object is left
 * unreadable as an image).
 */
export async function uploadMedia(file: {
  uri: string;
  contentType: UploadableContentType;
}): Promise<{ key: string; url: string }> {
  const contentLength = await localFileSize(file.uri);
  const { uploadUrl, key, publicUrl } = await presignUpload(file.contentType, contentLength);

  const res = await FileSystem.uploadAsync(uploadUrl, file.uri, {
    httpMethod: 'PUT',
    uploadType: FileSystem.FileSystemUploadType.BINARY_CONTENT,
    headers: {
      'Content-Type': file.contentType,
      'Content-Length': String(contentLength),
    },
  });

  if (res.status < 200 || res.status >= 300) {
    throw new Error(`Upload failed: ${res.status}`);
  }

  return { key, url: publicUrl };
}

/**
 * Uploads a document (e.g. a PDF from expo-document-picker) to S3 via a presigned PUT.
 *
 * Unlike `uploadMedia`, this reads the file with fetch()'s arrayBuffer() rather than
 * expo-file-system's native uploadAsync. expo-document-picker's cached copy goes through
 * Android's Storage Access Framework and isn't readable by expo-file-system's native
 * module in some environments (notably Expo Go) — fetch reads the file at the JS layer
 * instead, sidestepping that. arrayBuffer() (not blob()) keeps the bytes raw with no
 * base64 round-trip, so this doesn't carry the corruption risk noted on `uploadMedia`.
 */
export async function uploadDocument(file: {
  uri: string;
  contentType: 'application/pdf';
}): Promise<{ key: string; url: string }> {
  const fileResponse = await fetch(file.uri);
  const bytes = await fileResponse.arrayBuffer();
  const contentLength = bytes.byteLength;
  if (contentLength <= 0) {
    throw new Error('Could not determine file size for upload');
  }

  const { uploadUrl, key, publicUrl } = await presignUpload(file.contentType, contentLength);

  const uploadResponse = await fetch(uploadUrl, {
    method: 'PUT',
    headers: {
      'Content-Type': file.contentType,
      'Content-Length': String(contentLength),
    },
    body: bytes,
  });

  if (!uploadResponse.ok) {
    throw new Error(`Upload failed: ${uploadResponse.status}`);
  }

  return { key, url: publicUrl };
}
