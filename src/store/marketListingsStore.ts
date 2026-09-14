import { create } from 'zustand';
import type { ListingDto } from '@/features/listings/api/listingsApi';

interface MarketListingsState {
  listings: ListingDto[];
  setListings: (listings: ListingDto[]) => void;
}

export const useMarketListingsStore = create<MarketListingsState>((set) => ({
  listings: [],
  setListings: (listings) => set({ listings }),
}));
