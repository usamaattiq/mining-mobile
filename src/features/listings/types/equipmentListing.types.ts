import type { EquipmentListingMode, ListingCategory } from '@/navigation/types';
import type { EquipmentMediaAsset } from '@/features/listings/types/equipmentMedia.types';
import type { ListingOwner } from '@/features/listings/types/listingOwner.types';

export type DeliveryType = 'free' | 'perKm';

export type EquipmentListing = {
  id: string;
  category: ListingCategory;
  mode: EquipmentListingMode;
  equipmentTypeLabel: string;
  title: string;
  description: string;
  hourlyRental: string;
  monthlyRental: string;
  weeklyRental: string;
  salePrice: string;
  units: number;
  location: string;
  media: EquipmentMediaAsset[];
  deliveryAvailable: boolean;
  deliveryType: DeliveryType;
  deliveryPricePerKm: string;
  postedAs: 'buyer' | 'supplier';
  ownerId?: string;
  owner?: ListingOwner;
  createdAt: number;
};
