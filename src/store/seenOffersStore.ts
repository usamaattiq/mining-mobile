import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';

const STORAGE_KEY = 'seenOfferIds';
const MAX_IDS = 400;

interface SeenOffersState {
  ids: string[];
  hydrated: boolean;
  hydrate: () => Promise<void>;
  markSeen: (offerIds: string[]) => void;
}

export const useSeenOffersStore = create<SeenOffersState>((set, get) => ({
  ids: [],
  hydrated: false,
  hydrate: async () => {
    if (get().hydrated) return;
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      const parsed = raw ? (JSON.parse(raw) as unknown) : [];
      set({
        ids: Array.isArray(parsed) ? parsed.filter((id): id is string => typeof id === 'string') : [],
        hydrated: true,
      });
    } catch {
      set({ hydrated: true });
    }
  },
  markSeen: (offerIds) => {
    if (offerIds.length === 0) return;
    const next = new Set(get().ids);
    let changed = false;
    for (const id of offerIds) {
      if (!next.has(id)) {
        next.add(id);
        changed = true;
      }
    }
    if (!changed) return;
    const ids = [...next].slice(-MAX_IDS);
    set({ ids });
    void AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  },
}));
