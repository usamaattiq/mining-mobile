import { create } from 'zustand';
import type { Conversation } from '@/features/messages/types/conversation.types';

function lastMessageAt(conversation: Conversation): number {
  return conversation.messages.at(-1)?.sentAt ?? 0;
}

function sortConversations(conversations: Conversation[]): Conversation[] {
  return [...conversations].sort((a, b) => lastMessageAt(b) - lastMessageAt(a));
}

interface MessagesState {
  conversations: Conversation[];
  setConversations: (conversations: Conversation[]) => void;
  upsertConversation: (conversation: Conversation) => void;
}

export const useMessagesStore = create<MessagesState>((set) => ({
  conversations: [],
  setConversations: (conversations) => set({ conversations: sortConversations(conversations) }),
  upsertConversation: (conversation) =>
    set((state) => {
      const next = state.conversations.some((item) => item.id === conversation.id)
        ? state.conversations.map((item) => (item.id === conversation.id ? conversation : item))
        : [conversation, ...state.conversations];
      return { conversations: sortConversations(next) };
    }),
}));
