import type { EquipmentListing } from '@/features/listings/types/equipmentListing.types';
import type { GoldListing } from '@/features/listings/types/goldListing.types';
import type { ServiceListing } from '@/features/listings/types/serviceListing.types';
import {
  isEquipmentListing,
  isGoldListing,
  isServiceListing,
  listingsApi,
  type ListingDto,
} from '@/features/listings/api/listingsApi';
import { useGoldListingsStore } from '@/store/goldListingsStore';
import { useListingsStore } from '@/store/listingsStore';
import { useMarketListingsStore } from '@/store/marketListingsStore';
import { useOfferedListingsStore } from '@/store/offeredListingsStore';
import { useServiceListingsStore } from '@/store/serviceListingsStore';
import type { MarketplaceRole } from '@/navigation/types';
import { listingHasMyOffer } from '@/features/listings/utils/listingOfferState';

type RefreshOptions = { signal?: AbortSignal };

export function applyListings(listings: ListingDto[]): void {
  useListingsStore
    .getState()
    .setListings(
      listings.filter((item): item is EquipmentListing => item.category === 'equipment'),
    );
  useServiceListingsStore
    .getState()
    .setListings(listings.filter((item): item is ServiceListing => item.category === 'services'));
  useGoldListingsStore
    .getState()
    .setListings(listings.filter((item): item is GoldListing => item.category === 'gold'));
}

export async function refreshListings(
  postedAs?: MarketplaceRole,
  options?: RefreshOptions,
): Promise<void> {
  applyListings(await listingsApi.list(undefined, postedAs, options));
}

export async function refreshMarketListings(
  postedAs: MarketplaceRole,
  options?: RefreshOptions,
): Promise<void> {
  useMarketListingsStore
    .getState()
    .setListings(await listingsApi.feed(postedAs, undefined, options));
}

export async function refreshOfferedListings(options?: RefreshOptions): Promise<void> {
  useOfferedListingsStore.getState().setListings(await listingsApi.myOffers(options));
}

export function cacheListing(listing: ListingDto): void {
  const owned =
    useListingsStore.getState().listings.some((item) => item.id === listing.id) ||
    useServiceListingsStore.getState().listings.some((item) => item.id === listing.id) ||
    useGoldListingsStore.getState().listings.some((item) => item.id === listing.id);

  if (listingHasMyOffer(listing) && !owned) {
    useMarketListingsStore
      .getState()
      .setListings(
        useMarketListingsStore.getState().listings.filter((item) => item.id !== listing.id),
      );
    useOfferedListingsStore.getState().upsertListing(listing);
    return;
  }

  useOfferedListingsStore
    .getState()
    .setListings(
      useOfferedListingsStore.getState().listings.filter((item) => item.id !== listing.id),
    );
  useMarketListingsStore.getState().upsertListing(listing);
  if (isEquipmentListing(listing)) {
    useListingsStore.getState().addListing(listing);
  }
  if (isServiceListing(listing)) {
    useServiceListingsStore.getState().addListing(listing);
  }
  if (isGoldListing(listing)) {
    useGoldListingsStore.getState().addListing(listing);
  }
}
