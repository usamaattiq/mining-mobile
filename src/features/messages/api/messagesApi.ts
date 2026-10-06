import { apiFetch } from '@/shared/services/api';
import type { Conversation } from '@/features/messages/types/conversation.types';

export const messagesApi = {
  listConversations(options?: { signal?: AbortSignal }): Promise<Conversation[]> {
    return apiFetch('/messages/conversations', { signal: options?.signal });
  },

  getConversation(id: string): Promise<Conversation> {
    return apiFetch(`/messages/conversations/${id}`);
  },

  startConversation(listingId: string, buyerId?: string): Promise<Conversation> {
    return apiFetch('/messages/conversations', {
      method: 'POST',
      body: { listingId, ...(buyerId ? { buyerId } : {}) },
    });
  },

  sendMessage(conversationId: string, text: string): Promise<Conversation> {
    return apiFetch(`/messages/conversations/${conversationId}/messages`, {
      method: 'POST',
      body: { text },
    });
  },

  markRead(conversationId: string): Promise<Conversation> {
    return apiFetch(`/messages/conversations/${conversationId}/read`, { method: 'POST' });
  },
};
