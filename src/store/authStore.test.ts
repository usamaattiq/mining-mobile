jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn().mockResolvedValue(null),
  setItemAsync: jest.fn().mockResolvedValue(undefined),
  deleteItemAsync: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('@/navigation/navigationRef', () => ({
  navigationRef: {
    isReady: jest.fn().mockReturnValue(false),
    reset: jest.fn(),
  },
}));

jest.mock('@/shared/services/pushNotifications', () => ({
  registerForPushNotifications: jest.fn().mockResolvedValue(undefined),
  unregisterForPushNotifications: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('@/shared/services/chatSocket', () => ({
  chatSocket: { disconnect: jest.fn() },
}));

jest.mock('@/shared/services/api', () => ({
  setAuthTokenProvider: jest.fn(),
  setSessionRevokedHandler: jest.fn(),
  setRefreshHandler: jest.fn(),
}));

jest.mock('@/features/auth/api/authApi', () => ({
  authApi: { refresh: jest.fn() },
}));

import * as SecureStore from 'expo-secure-store';
import { navigationRef } from '@/navigation/navigationRef';
import { setRefreshHandler } from '@/shared/services/api';
import { authApi } from '@/features/auth/api/authApi';
import { useAuthStore } from '@/store/authStore';
import { useProfileStore } from '@/store/profileStore';

const attemptRefresh = (setRefreshHandler as jest.Mock).mock.calls[0][0] as () => Promise<boolean>;

describe('authStore.clear()', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useProfileStore.getState().setProfile({
      id: 'u1',
      fullName: 'Test User',
    } as never);
    useAuthStore.setState({ accessToken: 'token', status: 'authenticated' });
  });

  it('clears the profile store', async () => {
    await useAuthStore.getState().clear();
    expect(useProfileStore.getState().profile).toBeNull();
  });

  it('resets navigation to Onboarding when navigationRef is ready', async () => {
    (navigationRef.isReady as jest.Mock).mockReturnValue(true);

    await useAuthStore.getState().clear();

    expect(navigationRef.reset).toHaveBeenCalledWith({
      index: 0,
      routes: [{ name: 'Onboarding' }],
    });
  });

  it('does not touch navigation when navigationRef is not ready yet', async () => {
    (navigationRef.isReady as jest.Mock).mockReturnValue(false);

    await expect(useAuthStore.getState().clear()).resolves.not.toThrow();

    expect(navigationRef.reset).not.toHaveBeenCalled();
  });

  it('always ends in the unauthenticated state with no token', async () => {
    await useAuthStore.getState().clear();

    expect(useAuthStore.getState().status).toBe('unauthenticated');
    expect(useAuthStore.getState().accessToken).toBeNull();
  });
});

describe('authStore refresh handler', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('fails without throwing when there is no stored refresh token', async () => {
    (SecureStore.getItemAsync as jest.Mock).mockResolvedValue(null);

    await expect(attemptRefresh()).resolves.toBe(false);
    expect(authApi.refresh).not.toHaveBeenCalled();
  });

  it('rotates and persists the new token pair on success', async () => {
    (SecureStore.getItemAsync as jest.Mock).mockResolvedValue('session-id.old-secret');
    (authApi.refresh as jest.Mock).mockResolvedValue({
      accessToken: 'new-access',
      refreshToken: 'session-id.new-secret',
    });

    await expect(attemptRefresh()).resolves.toBe(true);

    expect(authApi.refresh).toHaveBeenCalledWith('session-id.old-secret');
    expect(SecureStore.setItemAsync).toHaveBeenCalledWith('auth.accessToken', 'new-access');
    expect(SecureStore.setItemAsync).toHaveBeenCalledWith(
      'auth.refreshToken',
      'session-id.new-secret',
    );
    expect(useAuthStore.getState().accessToken).toBe('new-access');
  });

  it('shares one in-flight refresh across concurrent callers', async () => {
    (SecureStore.getItemAsync as jest.Mock).mockResolvedValue('session-id.old-secret');
    let resolveRefresh!: (value: { accessToken: string; refreshToken: string }) => void;
    (authApi.refresh as jest.Mock).mockReturnValue(
      new Promise((resolve) => {
        resolveRefresh = resolve;
      }),
    );

    const first = attemptRefresh();
    const second = attemptRefresh();
    resolveRefresh({ accessToken: 'a', refreshToken: 'b' });

    await Promise.all([first, second]);
    expect(authApi.refresh).toHaveBeenCalledTimes(1);
  });

  it('fails without throwing when the server rejects the refresh token', async () => {
    (SecureStore.getItemAsync as jest.Mock).mockResolvedValue('session-id.old-secret');
    (authApi.refresh as jest.Mock).mockRejectedValue(new Error('expired'));

    await expect(attemptRefresh()).resolves.toBe(false);
  });
});
