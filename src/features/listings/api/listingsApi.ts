import { apiFetch } from '@/shared/services/api';
import type { ListingCategory } from '@/navigation/types';
import type { EquipmentListing } from '@/features/listings/types/equipmentListing.types';
import type { ServiceListing } from '@/features/listings/types/serviceListing.types';
import type { GoldListing } from '@/features/listings/types/goldListing.types';

export type ListingDto = EquipmentListing | ServiceListing | GoldListing;

export function isEquipmentListing(listing: ListingDto): listing is EquipmentListing {
  return listing.category === 'equipment';
}

export function isServiceListing(listing: ListingDto): listing is ServiceListing {
  return listing.category === 'services';
}

export function isGoldListing(listing: ListingDto): listing is GoldListing {
  return listing.category === 'gold';
}

export type CreateEquipmentListingBody = Omit<EquipmentListing, 'id' | 'createdAt'>;
export type CreateServiceListingBody = Omit<ServiceListing, 'id' | 'createdAt'>;
export type CreateGoldListingBody = Omit<GoldListing, 'id' | 'createdAt'>;
export type CreateListingBody =
  | CreateEquipmentListingBody
  | CreateServiceListingBody
  | CreateGoldListingBody;

export const listingsApi = {
  list(category?: ListingCategory): Promise<ListingDto[]> {
    const query = category ? `?category=${encodeURIComponent(category)}` : '';
    return apiFetch(`/listings${query}`);
  },

  get(id: string): Promise<ListingDto> {
    return apiFetch(`/listings/${id}`);
  },

  create(body: CreateListingBody): Promise<ListingDto> {
    return apiFetch('/listings', { method: 'POST', body });
  },
};
