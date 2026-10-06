import { create } from 'zustand';
import type { ChatMessage, Conversation } from '@/features/messages/types/conversation.types';

function lastMessageAt(conversation: Conversation): number {
  return conversation.messages.at(-1)?.sentAt ?? 0;
}

function sortConversations(conversations: Conversation[]): Conversation[] {
  return [...conversations].sort((a, b) => lastMessageAt(b) - lastMessageAt(a));
}

const STATUS_RANK: Record<NonNullable<ChatMessage['status']>, number> = {
  failed: 0,
  pending: 1,
  sent: 2,
  delivered: 3,
  read: 4,
};

function mergeMessage(previous: ChatMessage | undefined, incoming: ChatMessage): ChatMessage {
  if (!previous) {
    return incoming;
  }
  const previousRank = previous.status ? STATUS_RANK[previous.status] : 0;
  const incomingRank = incoming.status ? STATUS_RANK[incoming.status] : 0;
  const status = incomingRank >= previousRank ? incoming.status : previous.status;
  return { ...previous, ...incoming, status };
}

function mergeConversation(previous: Conversation, incoming: Conversation): Conversation {
  const previousById = new Map(previous.messages.map((message) => [message.id, message]));
  const seen = new Set<string>();
  const messages = incoming.messages.map((message) => {
    seen.add(message.id);
    return mergeMessage(previousById.get(message.id), message);
  });
  for (const message of previous.messages) {
    if (!seen.has(message.id)) {
      messages.push(message);
    }
  }
  messages.sort((a, b) => a.sentAt - b.sentAt || a.id.localeCompare(b.id));
  return { ...incoming, messages };
}

interface MessagesState {
  conversations: Conversation[];
  peerReadAt: Record<string, number>;
  setConversations: (conversations: Conversation[]) => void;
  upsertConversation: (conversation: Conversation) => void;
  applyIncomingMessage: (input: {
    conversationId: string;
    listingTitle: string;
    viewerId: string;
    senderId: string;
    message: ChatMessage;
  }) => void;
  applyReadReceipt: (input: {
    conversationId: string;
    readerId: string;
    readAt: number;
    viewerId: string;
  }) => void;
}

function withPeerRead(messages: ChatMessage[], readAt: number | undefined): ChatMessage[] {
  if (readAt == null) {
    return messages;
  }
  return messages.map((message) => {
    if (
      !message.fromMe ||
      message.sentAt > readAt ||
      message.status === 'read' ||
      message.status === 'failed'
    ) {
      return message;
    }
    return { ...message, status: 'read' as const };
  });
}

export const useMessagesStore = create<MessagesState>((set) => ({
  conversations: [],
  peerReadAt: {},
  setConversations: (conversations) => set({ conversations: sortConversations(conversations) }),
  upsertConversation: (conversation) =>
    set((state) => {
      const readAt = state.peerReadAt[conversation.id];
      const stamped = {
        ...conversation,
        messages: withPeerRead(conversation.messages, readAt),
      };
      const next = state.conversations.some((item) => item.id === stamped.id)
        ? state.conversations.map((item) =>
            item.id === stamped.id ? mergeConversation(item, stamped) : item,
          )
        : [stamped, ...state.conversations];
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
        messages: withPeerRead(
          [
            ...existing.messages,
            { ...message, fromMe, status: message.status ?? (fromMe ? 'sent' : undefined) },
          ],
          state.peerReadAt[conversationId],
        ),
      };
      return {
        conversations: sortConversations(
          state.conversations.map((item) => (item.id === conversationId ? nextConversation : item)),
        ),
      };
    }),
  applyReadReceipt: ({ conversationId, readerId, readAt, viewerId }) =>
    set((state) => {
      if (readerId === viewerId) {
        return state;
      }
      const previousReadAt = state.peerReadAt[conversationId] ?? 0;
      const nextReadAt = Math.max(previousReadAt, readAt);
      const peerReadAt = { ...state.peerReadAt, [conversationId]: nextReadAt };
      const existing = state.conversations.find((item) => item.id === conversationId);
      if (!existing) {
        return { ...state, peerReadAt };
      }
      const messages = withPeerRead(existing.messages, nextReadAt);
      const changed = messages.some((message, index) => message !== existing.messages[index]);
      if (!changed) {
        return { ...state, peerReadAt };
      }
      return {
        peerReadAt,
        conversations: state.conversations.map((item) =>
          item.id === conversationId ? { ...item, messages } : item,
        ),
      };
    }),
}));
