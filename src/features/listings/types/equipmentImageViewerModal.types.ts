import type { EquipmentMediaAsset } from '@/features/listings/types/equipmentMedia.types';

export type EquipmentImageViewerModalProps = {
  visible: boolean;
  media: EquipmentMediaAsset[];
  initialIndex: number;
  onClose: () => void;
};
