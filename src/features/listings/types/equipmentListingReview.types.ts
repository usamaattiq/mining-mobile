import type { EquipmentMediaAsset } from '@/features/listings/types/equipmentMedia.types';

export type EquipmentListingReviewRow = {
  label: string;
  value: string;
};

export type EquipmentListingReviewProps = {
  detailRows: EquipmentListingReviewRow[];
  media: EquipmentMediaAsset[];
  deliveryAvailable: boolean;
  onChangeDetails: () => void;
  onChangeMedia: () => void;
  onPublish: () => void;
  publishing: boolean;
};
