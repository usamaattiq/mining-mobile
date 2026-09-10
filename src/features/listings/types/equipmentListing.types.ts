import type { EquipmentListingMode } from '@/navigation/types';
import type { EquipmentMediaAsset } from '@/features/listings/types/equipmentMedia.types';

export type EquipmentListing = {
  id: string;
  mode: EquipmentListingMode;
  equipmentTypeLabel: string;
  title: string;
  description: string;
  hourlyRental: string;
  monthlyRental: string;
  yearlyRental: string;
  salePrice: string;
  units: number;
  media: EquipmentMediaAsset[];
  deliveryAvailable: boolean;
  createdAt: number;
};
