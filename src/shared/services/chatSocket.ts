import { io, type Socket } from 'socket.io-client';
import { env } from '@/shared/config/env';
import { authStore } from '@/store/authStore';

export type ChatRealtimePayload = {
  conversationId: string;
  senderId: string;
  listingTitle: string;
  message: {
    id: string;
    text: string;
    sentAt: number;
  };
};

function socketBaseUrl(): string {
  return env.API_URL.replace(/\/api\/?$/, '');
}

let socket: Socket | null = null;

function getSocket(): Socket {
  if (socket) {
    return socket;
  }

  socket = io(socketBaseUrl(), {
    path: '/socket.io',
    transports: ['websocket', 'polling'],
    upgrade: true,
    autoConnect: false,
    reconnection: true,
    reconnectionAttempts: 12,
  });

  return socket;
}

function ensureConnected(): Promise<Socket> {
  const active = getSocket();
  active.auth = { token: authStore.getToken() ?? '' };

  if (active.connected) {
    return Promise.resolve(active);
  }

  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      cleanup();
      reject(new Error('Chat socket timed out'));
    }, 12_000);

    const onConnect = () => {
      cleanup();
      resolve(active);
    };
    const onError = (err: Error) => {
      if (active.active) {
        return;
      }
      cleanup();
      reject(err);
    };
    const cleanup = () => {
      clearTimeout(timer);
      active.off('connect', onConnect);
      active.off('connect_error', onError);
    };

    active.on('connect', onConnect);
    active.on('connect_error', onError);
    active.connect();
  });
}

export const chatSocket = {
  connect(): Promise<Socket> {
    return ensureConnected();
  },

  onMessage(handler: (payload: ChatRealtimePayload) => void): () => void {
    const active = getSocket();
    active.on('chat:message', handler);
    return () => {
      active.off('chat:message', handler);
    };
  },

  disconnect(): void {
    if (!socket) {
      return;
    }
    socket.removeAllListeners();
    socket.disconnect();
    socket = null;
  },
};
