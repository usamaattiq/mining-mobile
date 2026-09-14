import type { EquipmentListing } from '@/features/listings/types/equipmentListing.types';
import type { GoldListing } from '@/features/listings/types/goldListing.types';
import type { ServiceListing } from '@/features/listings/types/serviceListing.types';
import type { ListingDto } from '@/features/listings/api/listingsApi';
import { listingsApi } from '@/features/listings/api/listingsApi';
import { useGoldListingsStore } from '@/store/goldListingsStore';
import { useListingsStore } from '@/store/listingsStore';
import { useMarketListingsStore } from '@/store/marketListingsStore';
import { useServiceListingsStore } from '@/store/serviceListingsStore';
import type { MarketplaceRole } from '@/navigation/types';

export function applyListings(listings: ListingDto[]): void {
  useListingsStore
    .getState()
    .setListings(listings.filter((item): item is EquipmentListing => item.category === 'equipment'));
  useServiceListingsStore
    .getState()
    .setListings(listings.filter((item): item is ServiceListing => item.category === 'services'));
  useGoldListingsStore
    .getState()
    .setListings(listings.filter((item): item is GoldListing => item.category === 'gold'));
}

export async function refreshListings(postedAs?: MarketplaceRole): Promise<void> {
  applyListings(await listingsApi.list(undefined, postedAs));
}

export async function refreshMarketListings(postedAs: MarketplaceRole): Promise<void> {
  useMarketListingsStore.getState().setListings(await listingsApi.feed(postedAs));
}
