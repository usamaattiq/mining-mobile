import type { ChatMessageDeliveryStatus } from '@/features/messages/types/conversation.types';

export type ChatBubbleProps = {
  text: string;
  time: string;
  fromMe: boolean;
  status?: ChatMessageDeliveryStatus;
  senderName?: string;
};
