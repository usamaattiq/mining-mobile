import { create } from 'zustand';
import type { ListingDto } from '@/features/listings/api/listingsApi';

interface OfferedListingsState {
  listings: ListingDto[];
  setListings: (listings: ListingDto[]) => void;
  upsertListing: (listing: ListingDto) => void;
}

export const useOfferedListingsStore = create<OfferedListingsState>((set) => ({
  listings: [],
  setListings: (listings) => set({ listings }),
  upsertListing: (listing) =>
    set((state) => ({
      listings: [listing, ...state.listings.filter((item) => item.id !== listing.id)],
    })),
}));
