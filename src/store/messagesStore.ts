import { create } from 'zustand';
import type { ChatMessage, Conversation } from '@/features/messages/types/conversation.types';

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
  applyIncomingMessage: (input: {
    conversationId: string;
    listingTitle: string;
    viewerId: string;
    senderId: string;
    message: ChatMessage;
  }) => void;
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
  applyIncomingMessage: ({ conversationId, listingTitle, viewerId, senderId, message }) =>
    set((state) => {
      const existing = state.conversations.find((item) => item.id === conversationId);
      if (!existing) {
        return state;
      }
      if (existing.messages.some((item) => item.id === message.id)) {
        return state;
      }
      const fromMe = senderId === viewerId;
      const nextConversation: Conversation = {
        ...existing,
        listingTitle: existing.listingTitle || listingTitle,
        unreadCount: fromMe ? existing.unreadCount : existing.unreadCount + 1,
        messages: [...existing.messages, { ...message, fromMe }],
      };
      return {
        conversations: sortConversations(
          state.conversations.map((item) => (item.id === conversationId ? nextConversation : item)),
        ),
      };
    }),
}));
