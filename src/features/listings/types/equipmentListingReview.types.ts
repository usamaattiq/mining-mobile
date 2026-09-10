import type { EquipmentMediaAsset } from '@/features/listings/types/equipmentMedia.types';

export type EquipmentListingReviewRow = {
  label: string;
  value: string;
};

export type EquipmentListingReviewProps = {
  detailRows: EquipmentListingReviewRow[];
  media: EquipmentMediaAsset[];
  deliveryAvailable: boolean;
  /** Precomputed "Free" or "Per KM · <price>" label — shown under the delivery banner. */
  deliverySubtitle?: string;
  onChangeDetails: () => void;
  onChangeMedia: () => void;
  onPublish: () => void;
  publishing: boolean;
};
