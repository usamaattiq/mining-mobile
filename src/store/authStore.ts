import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { navigationRef } from '@/navigation/navigationRef';
import { authApi } from '@/features/auth/api/authApi';
import {
  setAuthTokenProvider,
  setRefreshHandler,
  setSessionRevokedHandler,
} from '@/shared/services/api';
import {
  registerForPushNotifications,
  unregisterForPushNotifications,
} from '@/shared/services/pushNotifications';
import { useGoldListingsStore } from '@/store/goldListingsStore';
import { useListingsStore } from '@/store/listingsStore';
import { useMarketListingsStore } from '@/store/marketListingsStore';
import { useMessagesStore } from '@/store/messagesStore';
import { useNotificationsStore } from '@/store/notificationsStore';
import { useOfferedListingsStore } from '@/store/offeredListingsStore';
import { useProfileStore } from '@/store/profileStore';
import { chatSocket } from '@/shared/services/chatSocket';
import { useServiceListingsStore } from '@/store/serviceListingsStore';

const TOKEN_KEY = 'auth.accessToken';
const REFRESH_TOKEN_KEY = 'auth.refreshToken';

type AuthStatus = 'unknown' | 'authenticated' | 'unauthenticated';

interface AuthState {
  status: AuthStatus;
  accessToken: string | null;
  hydrate: () => Promise<void>;
  setAuthenticated: (accessToken: string, refreshToken: string) => Promise<void>;
  clear: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  status: 'unknown',
  accessToken: null,

  hydrate: async () => {
    const accessToken = await SecureStore.getItemAsync(TOKEN_KEY);
    set({ accessToken, status: accessToken ? 'authenticated' : 'unauthenticated' });
  },

  setAuthenticated: async (accessToken: string, refreshToken: string) => {
    await Promise.all([
      SecureStore.setItemAsync(TOKEN_KEY, accessToken),
      SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refreshToken),
    ]);
    set({ accessToken, status: 'authenticated' });
    // Token must be in store before the devices API call attaches Authorization.
    void registerForPushNotifications();
  },

  clear: async () => {
    // Unregister while the JWT is still available for the devices API.
    if (get().accessToken) {
      await unregisterForPushNotifications();
    }
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
    useListingsStore.getState().setListings([]);
    useServiceListingsStore.getState().setListings([]);
    useGoldListingsStore.getState().setListings([]);
    useMessagesStore.getState().setConversations([]);
    useNotificationsStore.getState().setItems([]);
    useMarketListingsStore.getState().setListings([]);
    useOfferedListingsStore.getState().setListings([]);
    useProfileStore.getState().clear();
    chatSocket.disconnect();
    set({ accessToken: null, status: 'unauthenticated' });
    // Every clear() caller (manual logout, a revoked/expired session hit
    // mid-use, a stale token found at startup) must end up back at
    // Onboarding. navigationRef isn't ready yet during the startup check
    // (the navigator hasn't mounted), which is fine — AppNavigator picks
    // its initial route from `status` at mount in that case.
    if (navigationRef.isReady()) {
      navigationRef.reset({ index: 0, routes: [{ name: 'Onboarding' }] });
    }
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

// Single-flight: several requests can 401 at the same moment, but they must
// share one refresh call — firing N parallel refreshes would have all but
// the first lose the token-rotation race and look like theft.
let refreshInFlight: Promise<boolean> | null = null;

async function attemptRefresh(): Promise<boolean> {
  if (refreshInFlight) return refreshInFlight;

  refreshInFlight = (async () => {
    const refreshToken = await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
    if (!refreshToken) return false;

    try {
      const result = await authApi.refresh(refreshToken);
      await Promise.all([
        SecureStore.setItemAsync(TOKEN_KEY, result.accessToken),
        SecureStore.setItemAsync(REFRESH_TOKEN_KEY, result.refreshToken),
      ]);
      useAuthStore.setState({ accessToken: result.accessToken });
      return true;
    } catch {
      return false;
    }
  })();

  try {
    return await refreshInFlight;
  } finally {
    refreshInFlight = null;
  }
}

setRefreshHandler(attemptRefresh);
