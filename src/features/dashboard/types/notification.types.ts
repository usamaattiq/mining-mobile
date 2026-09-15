import type { Ionicons } from '@expo/vector-icons';

export type NotificationTarget = 'Requests' | 'Messages' | 'HomeTab' | 'MyOffers';

export type InAppNotification = {
  id: string;
  titleKey: string;
  bodyKey: string;
  sentAt: number;
  read: boolean;
  icon: keyof typeof Ionicons.glyphMap;
  target: NotificationTarget;
};
