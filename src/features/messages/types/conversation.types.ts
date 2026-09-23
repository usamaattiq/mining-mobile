import type { ListingCategory } from '@/navigation/types';

/** Matches Stride chat ticks: one check sent, two checks delivered, blue checks read. */
export type ChatMessageDeliveryStatus = 'pending' | 'sent' | 'delivered' | 'read' | 'failed';

export type ChatMessage = {
  id: string;
  text: string;
  sentAt: number;
  fromMe: boolean;
  status?: ChatMessageDeliveryStatus;
};

export type Conversation = {
  id: string;
  listingId: string;
  listingTitle: string;
  listingCategory: ListingCategory;
  participantName: string;
  unreadCount: number;
  messages: ChatMessage[];
};
