import { create } from 'zustand';
import type { ListingDto } from '@/features/listings/api/listingsApi';

interface MarketListingsState {
  listings: ListingDto[];
  setListings: (listings: ListingDto[]) => void;
  upsertListing: (listing: ListingDto) => void;
}

export const useMarketListingsStore = create<MarketListingsState>((set) => ({
  listings: [],
  setListings: (listings) => set({ listings }),
  upsertListing: (listing) =>
    set((state) => ({
      listings: state.listings.some((item) => item.id === listing.id)
        ? state.listings.map((item) => (item.id === listing.id ? listing : item))
        : [listing, ...state.listings],
    })),
}));
