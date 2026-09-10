import type { UploadableContentType } from '@/shared/services/media';

export type AvatarPickerProps = {
  label?: string;
  uri: string | null;
  onChangeKey: (key: string | null) => void;
} & (
  | { deferUpload?: false; onPickLocal?: never }
  | {
      /** Skip the immediate upload (no auth token yet, e.g. during sign-up) and just preview
       * the picked image locally; the caller uploads it later via onPickLocal's asset. */
      deferUpload: true;
      onPickLocal: (asset: { uri: string; contentType: UploadableContentType } | null) => void;
    }
);
