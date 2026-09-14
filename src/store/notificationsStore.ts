import { create } from 'zustand';
import type { InAppNotification } from '@/features/dashboard/types/notification.types';

interface NotificationsState {
  items: InAppNotification[];
  setItems: (items: InAppNotification[]) => void;
}

export const useNotificationsStore = create<NotificationsState>((set) => ({
  items: [],
  setItems: (items) => set({ items }),
}));
