import { create } from 'zustand';
import type { GoldListing } from '@/features/listings/types/goldListing.types';

interface GoldListingsState {
  listings: GoldListing[];
  setListings: (listings: GoldListing[]) => void;
  addListing: (listing: GoldListing) => void;
}

export const useGoldListingsStore = create<GoldListingsState>((set) => ({
  listings: [],
  setListings: (listings) => set({ listings }),
  addListing: (listing) =>
    set((state) => ({
      listings: [listing, ...state.listings.filter((item) => item.id !== listing.id)],
    })),
}));
