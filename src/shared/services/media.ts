import { env } from '@/shared/config/env';
import { apiFetch } from './api';

export type UploadableContentType = 'image/jpeg' | 'image/png' | 'image/webp' | 'application/pdf';

type PresignUploadResult = { uploadUrl: string; key: string; expiresIn: number };

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
 * presigned PUT, then returns the object key to store on the backend record
 * (avatar, document, etc) — never the raw S3 URL, since the bucket is private.
 */
export async function uploadMedia(file: {
  uri: string;
  contentType: UploadableContentType;
}): Promise<{ key: string }> {
  const { uploadUrl, key } = await presignUpload(file.contentType);
  const blob = await (await fetch(file.uri)).blob();

  const res = await fetch(uploadUrl, {
    method: 'PUT',
    headers: { 'Content-Type': file.contentType },
    body: blob,
  });

  if (!res.ok) {
    throw new Error(`Upload failed: ${res.status}`);
  }

  return { key };
}
