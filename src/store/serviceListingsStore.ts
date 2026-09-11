import { create } from 'zustand';
import type { ServiceListing } from '@/features/listings/types/serviceListing.types';

interface ServiceListingsState {
  listings: ServiceListing[];
  addListing: (listing: ServiceListing) => void;
}

export const useServiceListingsStore = create<ServiceListingsState>((set) => ({
  listings: [],
  addListing: (listing) => set((state) => ({ listings: [listing, ...state.listings] })),
}));
