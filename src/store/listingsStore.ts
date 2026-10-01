import { create } from 'zustand';
import type { EquipmentListing } from '@/features/listings/types/equipmentListing.types';

interface ListingsState {
  listings: EquipmentListing[];
  setListings: (listings: EquipmentListing[]) => void;
  addListing: (listing: EquipmentListing) => void;
}

export const useListingsStore = create<ListingsState>((set) => ({
  listings: [],
  setListings: (listings) => set({ listings }),
  addListing: (listing) =>
    set((state) => ({
      listings: [listing, ...state.listings.filter((item) => item.id !== listing.id)],
    })),
}));
