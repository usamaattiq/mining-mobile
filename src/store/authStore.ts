import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { setAuthTokenProvider, setSessionRevokedHandler } from '@/shared/services/api';
import { useGoldListingsStore } from '@/store/goldListingsStore';
import { useListingsStore } from '@/store/listingsStore';
import { useMessagesStore } from '@/store/messagesStore';
import { useNotificationsStore } from '@/store/notificationsStore';
import { useServiceListingsStore } from '@/store/serviceListingsStore';

const TOKEN_KEY = 'auth.accessToken';

type AuthStatus = 'unknown' | 'authenticated' | 'unauthenticated';

interface AuthState {
  status: AuthStatus;
  accessToken: string | null;
  hydrate: () => Promise<void>;
  setAuthenticated: (accessToken: string) => Promise<void>;
  clear: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  status: 'unknown',
  accessToken: null,

  hydrate: async () => {
    const accessToken = await SecureStore.getItemAsync(TOKEN_KEY);
    set({ accessToken, status: accessToken ? 'authenticated' : 'unauthenticated' });
  },

  setAuthenticated: async (accessToken: string) => {
    await SecureStore.setItemAsync(TOKEN_KEY, accessToken);
    set({ accessToken, status: 'authenticated' });
  },

  clear: async () => {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    useListingsStore.getState().setListings([]);
    useServiceListingsStore.getState().setListings([]);
    useGoldListingsStore.getState().setListings([]);
    useMessagesStore.getState().setConversations([]);
    useNotificationsStore.getState().setItems([]);
    set({ accessToken: null, status: 'unauthenticated' });
  },
}));

// Non-reactive accessor so the axios-less fetch client can read the token
// outside of React without subscribing to the store.
export const authStore = {
  getToken: (): string | null => useAuthStore.getState().accessToken,
};

setAuthTokenProvider(authStore.getToken);
setSessionRevokedHandler(() => {
  void useAuthStore.getState().clear();
});
