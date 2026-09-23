import type { EquipmentMediaAsset } from '@/features/listings/types/equipmentMedia.types';
import type { EquipmentListingReviewRow } from '@/features/listings/types/equipmentListingReview.types';

export type EquipmentListingSummaryCardProps = {
  detailRows: EquipmentListingReviewRow[];
  media: EquipmentMediaAsset[];
  /** Shows a "Change" link on the details section when provided. */
  onChangeDetails?: () => void;
  /** Shows a "Change" link on the media section when provided. */
  onChangeMedia?: () => void;
  /** Skips the media section entirely — use when the caller already shows the photos elsewhere (e.g. a carousel). */
  hideMedia?: boolean;
  /** Collapsible description row inside the details card. */
  description?: string;
};
