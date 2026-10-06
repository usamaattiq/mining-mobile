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
}));

import { navigationRef } from '@/navigation/navigationRef';
import { useAuthStore } from '@/store/authStore';
import { useProfileStore } from '@/store/profileStore';

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
