import type { UploadableContentType } from '@/shared/services/media';

export type AvatarPickerProps = {
  label?: string;
  /** Displayable image URL (not an S3 key) — already resolved by the caller/upload result. */
  uri: string | null;
  onChangeUrl: (url: string | null) => void;
} & (
  | { deferUpload?: false; onPickLocal?: never }
  | {
      /** Skip the immediate upload (no auth token yet, e.g. during sign-up) and just preview
       * the picked image locally; the caller uploads it later via onPickLocal's asset. */
      deferUpload: true;
      onPickLocal: (asset: { uri: string; contentType: UploadableContentType } | null) => void;
    }
);
