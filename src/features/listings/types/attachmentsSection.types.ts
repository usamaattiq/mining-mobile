import type { ServiceMediaAsset } from '@/features/listings/types/serviceMedia.types';

export type AttachmentsSectionProps = {
  documents: ServiceMediaAsset[];
  /** Whether rows are pressable and download the document. Defaults to true; pass false for a read-only list (e.g. the form's review step). */
  downloadable?: boolean;
};
