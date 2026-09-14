import { create } from 'zustand';
import type { InAppNotification } from '@/features/dashboard/types/notification.types';

const now = Date.now();
const minute = 60 * 1000;
const hour = 60 * minute;
const day = 24 * hour;

const seed: InAppNotification[] = [
  {
    id: 'n1',
    titleKey: 'notifications.offerReceivedTitle',
    bodyKey: 'notifications.offerReceivedBody',
    sentAt: now - 12 * minute,
    read: false,
    icon: 'pricetag-outline',
    target: 'Requests',
  },
  {
    id: 'n2',
    titleKey: 'notifications.messageTitle',
    bodyKey: 'notifications.messageBody',
    sentAt: now - 2 * hour,
    read: false,
    icon: 'chatbubble-ellipses-outline',
    target: 'Messages',
  },
  {
    id: 'n3',
    titleKey: 'notifications.auctionTitle',
    bodyKey: 'notifications.auctionBody',
    sentAt: now - day,
    read: true,
    icon: 'hammer-outline',
    target: 'Requests',
  },
  {
    id: 'n4',
    titleKey: 'notifications.listingLiveTitle',
    bodyKey: 'notifications.listingLiveBody',
    sentAt: now - 2 * day,
    read: true,
    icon: 'checkmark-circle-outline',
    target: 'HomeTab',
  },
];

interface NotificationsState {
  items: InAppNotification[];
  markRead: (id: string) => void;
  markAllRead: () => void;
}

export const useNotificationsStore = create<NotificationsState>((set) => ({
  items: seed,
  markRead: (id) =>
    set((state) => ({
      items: state.items.map((item) => (item.id === id ? { ...item, read: true } : item)),
    })),
  markAllRead: () =>
    set((state) => ({
      items: state.items.map((item) => ({ ...item, read: true })),
    })),
}));
