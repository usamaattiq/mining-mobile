import { apiFetch } from './api';

export type UploadableContentType = 'image/jpeg' | 'image/png' | 'image/webp' | 'application/pdf';

type PresignUploadResult = { uploadUrl: string; key: string; expiresIn: number };
type PresignViewResult = { url: string; expiresIn: number };

/** Backend keeps the bucket private — every view goes through a fresh signed URL. */
export function resolveMediaUrl(key: string): Promise<PresignViewResult> {
  return apiFetch(`/uploads/presign-view?key=${encodeURIComponent(key)}`);
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
