import { create } from 'zustand';
import type { ServiceListing } from '@/features/listings/types/serviceListing.types';

interface ServiceListingsState {
  listings: ServiceListing[];
  setListings: (listings: ServiceListing[]) => void;
  addListing: (listing: ServiceListing) => void;
}

export const useServiceListingsStore = create<ServiceListingsState>((set) => ({
  listings: [],
  setListings: (listings) => set({ listings }),
  addListing: (listing) =>
    set((state) => ({
      listings: [listing, ...state.listings.filter((item) => item.id !== listing.id)],
    })),
}));
