import Constants from 'expo-constants';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import type * as ExpoNotifications from 'expo-notifications';
import { apiFetch } from '@/shared/services/api';

// Explicit projectId is required for getExpoPushTokenAsync in EAS builds —
// it can't always be inferred from the app config at runtime.
const EAS_PROJECT_ID = Constants.expoConfig?.extra?.eas?.projectId;

// Expo Go (SDK 53+) doesn't ship the native notifications module. Merely
// *importing* `expo-notifications` runs code that throws on Android in Expo
// Go (see its DevicePushTokenAutoRegistration side effect), so the module
// must never be statically imported — always load it lazily via this getter
// and only when not running in Expo Go.
export const isPushAvailable = Constants.appOwnership !== 'expo';

type NotificationsModule = typeof ExpoNotifications;

let notificationsModulePromise: Promise<NotificationsModule> | null = null;

async function loadNotifications(): Promise<NotificationsModule> {
  if (!notificationsModulePromise) {
    notificationsModulePromise = import('expo-notifications').then((Notifications) => {
      Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowBanner: true,
          shouldShowList: true,
          shouldPlaySound: true,
          shouldSetBadge: false,
        }),
      });
      return Notifications;
    });
  }
  return notificationsModulePromise;
}

export class PushPermissionDeniedError extends Error {
  constructor() {
    super('Push notification permission was not granted');
    this.name = 'PushPermissionDeniedError';
  }
}

// Requests permission and returns the Expo push token, or null on a
// simulator/emulator where physical push isn't supported.
export async function getExpoPushToken(): Promise<string | null> {
  if (!isPushAvailable) {
    console.warn('[push] Skipping push token — not supported in Expo Go');
    return null;
  }

  if (!Device.isDevice) {
    console.warn('[push] Skipping push token — not a physical device');
    return null;
  }

  const Notifications = await loadNotifications();

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      sound: 'default',
    });
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    throw new PushPermissionDeniedError();
  }

  if (!EAS_PROJECT_ID) {
    console.error('[push] Missing extra.eas.projectId in app config — cannot get push token');
    return null;
  }

  const { data: expoPushToken } = await Notifications.getExpoPushTokenAsync({
    projectId: EAS_PROJECT_ID,
  });
  return expoPushToken;
}

interface RegisteredDevice {
  id: string;
  userId: string;
  platform: 'ios' | 'android';
  expoPushToken: string;
  isActive: boolean;
}

export async function registerDeviceWithBackend(expoPushToken: string): Promise<RegisteredDevice> {
  return apiFetch<RegisteredDevice>('/notifications/devices', {
    method: 'POST',
    body: {
      platform: Platform.OS === 'ios' ? 'ios' : 'android',
      expoPushToken,
    },
  });
}

export async function unregisterDeviceWithBackend(expoPushToken: string): Promise<void> {
  await apiFetch('/notifications/devices/unregister', {
    method: 'POST',
    body: { expoPushToken },
  });
}

// Call after login. Safe to call multiple times (backend upserts by token).
export async function registerForPushNotifications(): Promise<void> {
  try {
    const token = await getExpoPushToken();
    if (!token) return;
    await registerDeviceWithBackend(token);
  } catch (error) {
    if (error instanceof PushPermissionDeniedError) {
      console.warn('[push] User denied notification permission');
      return;
    }
    console.error('[push] Failed to register device for push notifications', error);
  }
}

// Call on logout so the backend/Ping stop targeting this device.
export async function unregisterForPushNotifications(): Promise<void> {
  if (!isPushAvailable) return;
  try {
    const Notifications = await loadNotifications();
    const { status } = await Notifications.getPermissionsAsync();
    if (status !== 'granted' || !EAS_PROJECT_ID) return;
    const { data: token } = await Notifications.getExpoPushTokenAsync({
      projectId: EAS_PROJECT_ID,
    });
    await unregisterDeviceWithBackend(token);
  } catch (error) {
    console.error('[push] Failed to unregister device for push notifications', error);
  }
}
