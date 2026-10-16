import { apiFetch } from '@/shared/services/api';
import type { ListingCategory, MarketplaceRole } from '@/navigation/types';
import type { EquipmentListing } from '@/features/listings/types/equipmentListing.types';
import type { ServiceListing } from '@/features/listings/types/serviceListing.types';
import type { GoldListing } from '@/features/listings/types/goldListing.types';

export type ListingDto = EquipmentListing | ServiceListing | GoldListing;

export type EquipmentStockHold = {
  id: string;
  kind: 'rent' | 'sale';
  units: number;
  status: 'active' | 'selected' | 'returned';
  buyerId?: string;
  buyerName: string;
  buyerPhone?: string;
  price: string;
  createdAt: number;
  acceptedAt?: number;
};

export type EquipmentStock = {
  totalUnits: number;
  availableUnits: number;
  rentUnits: number;
  saleUnits: number;
  holds: EquipmentStockHold[];
};

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
> & { expiryHours?: number };
export type CreateServiceListingBody = Omit<
  ServiceListing,
  'id' | 'createdAt' | 'ownerId' | 'owner' | 'rfq'
> & { expiryHours?: number };
export type CreateGoldListingBody = Omit<GoldListing, 'id' | 'createdAt' | 'ownerId' | 'owner'>;
export type CreateListingBody =
  CreateEquipmentListingBody | CreateServiceListingBody | CreateGoldListingBody;

type FetchOptions = { signal?: AbortSignal };

export const listingsApi = {
  list(
    category?: ListingCategory,
    postedAs?: MarketplaceRole,
    options?: FetchOptions,
  ): Promise<ListingDto[]> {
    const params = new URLSearchParams();
    if (category) params.set('category', category);
    if (postedAs) params.set('postedAs', postedAs);
    const query = params.toString();
    return apiFetch(`/listings${query ? `?${query}` : ''}`, { signal: options?.signal });
  },

  feed(
    postedAs: MarketplaceRole,
    category?: ListingCategory,
    options?: FetchOptions,
  ): Promise<ListingDto[]> {
    const params = new URLSearchParams({ postedAs });
    if (category) params.set('category', category);
    return apiFetch(`/listings/feed?${params.toString()}`, { signal: options?.signal });
  },

  myOffers(options?: FetchOptions): Promise<ListingDto[]> {
    return apiFetch('/listings/my-offers', { signal: options?.signal });
  },

  get(id: string): Promise<ListingDto> {
    return apiFetch(`/listings/${id}`);
  },

  remove(id: string): Promise<{ deleted: boolean }> {
    return apiFetch(`/listings/${id}`, { method: 'DELETE' });
  },

  create(body: CreateListingBody): Promise<ListingDto> {
    return apiFetch('/listings', { method: 'POST', body });
  },

  update(id: string, body: CreateListingBody): Promise<ListingDto> {
    return apiFetch(`/listings/${id}`, { method: 'PATCH', body });
  },

  submitOffer(
    id: string,
    price: string,
    units?: number,
    fulfillment?: 'rent' | 'sale',
    delivery?: 'onsite' | 'online',
    handover?: 'pickup' | 'delivery',
    description?: string,
  ): Promise<ListingDto> {
    return apiFetch(`/listings/${id}/offers`, {
      method: 'POST',
      body: {
        price,
        ...(units != null ? { units } : {}),
        ...(fulfillment ? { fulfillment } : {}),
        ...(delivery ? { delivery } : {}),
        ...(handover ? { handover } : {}),
        ...(description ? { description } : {}),
      },
    });
  },

  equipmentStock(id: string): Promise<EquipmentStock> {
    return apiFetch(`/listings/${id}/stock`);
  },

  updateEquipmentUnits(id: string, units: number): Promise<EquipmentStock> {
    return apiFetch(`/listings/${id}/stock`, { method: 'PATCH', body: { units } });
  },

  returnRentedUnits(id: string, holdId: string): Promise<EquipmentStock> {
    return apiFetch(`/listings/${id}/stock/${holdId}/return`, { method: 'POST', body: {} });
  },

  acceptOffer(id: string, offerId: string): Promise<ListingDto> {
    return apiFetch(`/listings/${id}/offers/${offerId}/accept`, { method: 'POST', body: {} });
  },

  rejectOffer(id: string, offerId: string): Promise<ListingDto> {
    return apiFetch(`/listings/${id}/offers/${offerId}/reject`, { method: 'POST', body: {} });
  },

  confirmOffer(id: string, offerId: string): Promise<ListingDto> {
    return apiFetch(`/listings/${id}/offers/${offerId}/confirm`, { method: 'POST', body: {} });
  },

  declineOffer(id: string, offerId: string): Promise<ListingDto> {
    return apiFetch(`/listings/${id}/offers/${offerId}/decline`, { method: 'POST', body: {} });
  },

  updateOffer(
    id: string,
    offerId: string,
    price: string,
    units?: number,
    fulfillment?: 'rent' | 'sale',
    handover?: 'pickup' | 'delivery',
    delivery?: 'onsite' | 'online',
    description?: string,
  ): Promise<ListingDto> {
    return apiFetch(`/listings/${id}/offers/${offerId}`, {
      method: 'PATCH',
      body: {
        price,
        ...(units != null ? { units } : {}),
        ...(fulfillment ? { fulfillment } : {}),
        ...(handover ? { handover } : {}),
        ...(delivery ? { delivery } : {}),
        description: description ?? '',
      },
    });
  },

  withdrawOffer(id: string, offerId: string): Promise<ListingDto> {
    return apiFetch(`/listings/${id}/offers/${offerId}/withdraw`, { method: 'POST', body: {} });
  },

  catalog(category: 'equipment' | 'services' | 'gold'): Promise<{
    names: string[];
    items?: { id: string; name: string; nameAr?: string | null; parentId: string | null }[];
  }> {
    return apiFetch(`/listings/catalog?category=${category}`);
  },

  appSettings(): Promise<{
    messageOnSend: boolean;
    buyerEquipmentRfq: boolean;
    buyerEquipmentAuction: boolean;
  }> {
    return apiFetch('/listings/settings');
  },

  units(): Promise<{ items: { id: string; name: string; nameAr: string | null }[] }> {
    return apiFetch('/listings/units');
  },
};
