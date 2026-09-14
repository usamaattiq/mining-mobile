export type ChatMessage = {
  id: string;
  text: string;
  sentAt: number;
  fromMe: boolean;
};

export type Conversation = {
  id: string;
  participantName: string;
  listingTitle: string;
  unreadCount: number;
  messages: ChatMessage[];
};
