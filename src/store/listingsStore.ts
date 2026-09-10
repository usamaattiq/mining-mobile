import { create } from 'zustand';
import type { EquipmentListing } from '@/features/listings/types/equipmentListing.types';

interface ListingsState {
  listings: EquipmentListing[];
  addListing: (listing: EquipmentListing) => void;
}

export const useListingsStore = create<ListingsState>((set) => ({
  listings: [],
  addListing: (listing) => set((state) => ({ listings: [listing, ...state.listings] })),
}));
