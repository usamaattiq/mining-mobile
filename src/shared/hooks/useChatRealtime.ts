import React from 'react';
import { chatSocket, type ChatRealtimePayload } from '@/shared/services/chatSocket';
import { messagesApi } from '@/features/messages/api/messagesApi';
import { useAuthStore } from '@/store/authStore';
import { useMessagesStore } from '@/store/messagesStore';
import { useProfileStore } from '@/store/profileStore';

export function useChatRealtime(): void {
  const authStatus = useAuthStore((state) => state.status);
  const viewerId = useProfileStore((state) => state.profile?.id);

  React.useEffect(() => {
    if (authStatus !== 'authenticated' || !viewerId) {
      chatSocket.disconnect();
      return;
    }

    void chatSocket.connect().catch(() => undefined);

    const unsubscribe = chatSocket.onMessage((payload: ChatRealtimePayload) => {
      const store = useMessagesStore.getState();
      const known = store.conversations.some((item) => item.id === payload.conversationId);
      if (!known) {
        void messagesApi
          .getConversation(payload.conversationId)
          .then((conversation) => store.upsertConversation(conversation))
          .catch(() => undefined);
        return;
      }

      store.applyIncomingMessage({
        conversationId: payload.conversationId,
        listingTitle: payload.listingTitle,
        viewerId,
        senderId: payload.senderId,
        message: {
          id: payload.message.id,
          text: payload.message.text,
          sentAt: payload.message.sentAt,
          fromMe: payload.senderId === viewerId,
        },
      });
    });

    return () => {
      unsubscribe();
      chatSocket.disconnect();
    };
  }, [authStatus, viewerId]);
}
