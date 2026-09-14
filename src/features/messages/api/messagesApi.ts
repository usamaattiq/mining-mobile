import { apiFetch } from '@/shared/services/api';
import type { Conversation } from '@/features/messages/types/conversation.types';

export const messagesApi = {
  listConversations(): Promise<Conversation[]> {
    return apiFetch('/messages/conversations');
  },

  getConversation(id: string): Promise<Conversation> {
    return apiFetch(`/messages/conversations/${id}`);
  },

  startConversation(listingId: string): Promise<Conversation> {
    return apiFetch('/messages/conversations', { method: 'POST', body: { listingId } });
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
