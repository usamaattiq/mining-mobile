import { create } from 'zustand';
import type { Conversation } from '@/features/messages/types/conversation.types';

const now = Date.now();
const minute = 60 * 1000;
const hour = 60 * minute;
const day = 24 * hour;

const seedConversations: Conversation[] = [
  {
    id: 'c1',
    participantName: 'Omar Al-Rashid',
    listingTitle: 'CAT 336 Excavator',
    unreadCount: 2,
    messages: [
      {
        id: 'c1-m1',
        text: 'Is the excavator still available for a 2-week rental?',
        sentAt: now - 2 * hour,
        fromMe: false,
      },
      {
        id: 'c1-m2',
        text: 'Yes — hourly and weekly rates are both open this month.',
        sentAt: now - 90 * minute,
        fromMe: true,
      },
      {
        id: 'c1-m3',
        text: 'Can you include delivery to the Ras Al-Khair site?',
        sentAt: now - 18 * minute,
        fromMe: false,
      },
      {
        id: 'c1-m4',
        text: 'We can deliver Tuesday morning if that works.',
        sentAt: now - 12 * minute,
        fromMe: false,
      },
    ],
  },
  {
    id: 'c2',
    participantName: 'Noura Mining Co.',
    listingTitle: 'On-site geological survey',
    unreadCount: 0,
    messages: [
      {
        id: 'c2-m1',
        text: 'We reviewed your survey package. Can you start next week?',
        sentAt: now - 5 * hour,
        fromMe: false,
      },
      {
        id: 'c2-m2',
        text: 'Yes. I’ll send the crew roster and a draft schedule today.',
        sentAt: now - 4 * hour,
        fromMe: true,
      },
    ],
  },
  {
    id: 'c3',
    participantName: 'Khalid Fahad',
    listingTitle: '22K gold bar auction',
    unreadCount: 1,
    messages: [
      {
        id: 'c3-m1',
        text: 'What is the current bid on the 22K bar?',
        sentAt: now - day - 3 * hour,
        fromMe: false,
      },
      {
        id: 'c3-m2',
        text: 'Opening price is listed. I’ll ping you if a new bid lands.',
        sentAt: now - day - 2 * hour,
        fromMe: true,
      },
      {
        id: 'c3-m3',
        text: 'Thanks — I’ll watch the auction close.',
        sentAt: now - 6 * hour,
        fromMe: false,
      },
    ],
  },
];

function lastMessageAt(conversation: Conversation): number {
  return conversation.messages.at(-1)?.sentAt ?? 0;
}

interface MessagesState {
  conversations: Conversation[];
  markRead: (conversationId: string) => void;
  sendMessage: (conversationId: string, text: string) => void;
}

export const useMessagesStore = create<MessagesState>((set) => ({
  conversations: [...seedConversations].sort((a, b) => lastMessageAt(b) - lastMessageAt(a)),
  markRead: (conversationId) =>
    set((state) => ({
      conversations: state.conversations.map((conversation) =>
        conversation.id === conversationId ? { ...conversation, unreadCount: 0 } : conversation,
      ),
    })),
  sendMessage: (conversationId, text) =>
    set((state) => {
      const next = state.conversations.map((conversation) => {
        if (conversation.id !== conversationId) return conversation;
        return {
          ...conversation,
          unreadCount: 0,
          messages: [
            ...conversation.messages,
            {
              id: `${conversationId}-${Date.now()}`,
              text,
              sentAt: Date.now(),
              fromMe: true,
            },
          ],
        };
      });
      return { conversations: next.sort((a, b) => lastMessageAt(b) - lastMessageAt(a)) };
    }),
}));
