import type { ListingCategory } from '@/navigation/types';

export type ChatMessage = {
  id: string;
  text: string;
  sentAt: number;
  fromMe: boolean;
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
