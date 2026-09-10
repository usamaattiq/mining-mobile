import type { EquipmentListing } from '@/features/listings/types/equipmentListing.types';

export type EquipmentListingCardProps = {
  listing: EquipmentListing;
  onPress: () => void;
};
