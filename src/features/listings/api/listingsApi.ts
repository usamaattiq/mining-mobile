import { apiFetch } from '@/shared/services/api';
import type { ListingCategory, MarketplaceRole } from '@/navigation/types';
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

export type CreateEquipmentListingBody = Omit<
  EquipmentListing,
  'id' | 'createdAt' | 'ownerId' | 'owner' | 'rfq'
>;
export type CreateServiceListingBody = Omit<
  ServiceListing,
  'id' | 'createdAt' | 'ownerId' | 'owner' | 'rfq'
>;
export type CreateGoldListingBody = Omit<GoldListing, 'id' | 'createdAt' | 'ownerId' | 'owner'>;
export type CreateListingBody =
  | CreateEquipmentListingBody
  | CreateServiceListingBody
  | CreateGoldListingBody;

export const listingsApi = {
  list(category?: ListingCategory, postedAs?: MarketplaceRole): Promise<ListingDto[]> {
    const params = new URLSearchParams();
    if (category) params.set('category', category);
    if (postedAs) params.set('postedAs', postedAs);
    const query = params.toString();
    return apiFetch(`/listings${query ? `?${query}` : ''}`);
  },

  feed(postedAs: MarketplaceRole, category?: ListingCategory): Promise<ListingDto[]> {
    const params = new URLSearchParams({ postedAs });
    if (category) params.set('category', category);
    return apiFetch(`/listings/feed?${params.toString()}`);
  },

  get(id: string): Promise<ListingDto> {
    return apiFetch(`/listings/${id}`);
  },

  create(body: CreateListingBody): Promise<ListingDto> {
    return apiFetch('/listings', { method: 'POST', body });
  },

  submitOffer(id: string, price: string): Promise<ListingDto> {
    return apiFetch(`/listings/${id}/offers`, { method: 'POST', body: { price } });
  },

  acceptOffer(id: string, offerId: string): Promise<ListingDto> {
    return apiFetch(`/listings/${id}/offers/${offerId}/accept`, { method: 'POST', body: {} });
  },

  rejectOffer(id: string, offerId: string): Promise<ListingDto> {
    return apiFetch(`/listings/${id}/offers/${offerId}/reject`, { method: 'POST', body: {} });
  },
};
