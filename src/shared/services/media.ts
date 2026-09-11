import * as FileSystem from 'expo-file-system/legacy';
import { env } from '@/shared/config/env';
import { apiFetch } from './api';

export type UploadableContentType = 'image/jpeg' | 'image/png' | 'image/webp' | 'application/pdf';

type PresignUploadResult = { uploadUrl: string; key: string; publicUrl: string; expiresIn: number };

/** Builds a directly-accessible URL for an S3 object key stored via mining-api. */
export function resolveMediaUrl(key: string | null | undefined): string | null {
  if (!key?.trim()) return null;
  const base = env.s3PublicBaseUrl;
  if (!base) return null;
  return `${base.replace(/\/$/, '')}/${key.replace(/^\//, '')}`;
}

async function presignUpload(contentType: UploadableContentType): Promise<PresignUploadResult> {
  return apiFetch('/uploads/presign', { method: 'POST', body: { contentType } });
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
  const { uploadUrl, key, publicUrl } = await presignUpload(file.contentType);

  const res = await FileSystem.uploadAsync(uploadUrl, file.uri, {
    httpMethod: 'PUT',
    uploadType: FileSystem.FileSystemUploadType.BINARY_CONTENT,
    headers: { 'Content-Type': file.contentType },
  });

  if (res.status < 200 || res.status >= 300) {
    throw new Error(`Upload failed: ${res.status}`);
  }

  return { key, url: publicUrl };
}
