import { create } from 'zustand';
import type { GoldListing } from '@/features/listings/types/goldListing.types';

interface GoldListingsState {
  listings: GoldListing[];
  addListing: (listing: GoldListing) => void;
}

export const useGoldListingsStore = create<GoldListingsState>((set) => ({
  listings: [],
  addListing: (listing) => set((state) => ({ listings: [listing, ...state.listings] })),
}));
