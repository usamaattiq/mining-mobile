import React from 'react';
import { Linking, Platform } from 'react-native';
import { isPushAvailable } from '@/shared/services/pushNotifications';
import { navigationRef } from '@/navigation/navigationRef';
import type { ListingCategory } from '@/navigation/types';

function openDeepLink(deepLink: string): void {
  Linking.openURL(deepLink).catch((error) => {
    console.error('[push] Failed to open deep link from notification', error);
  });
}

function navigateFromNotificationData(data: Record<string, unknown> | undefined): boolean {
  if (!data || !navigationRef.isReady()) return false;

  const conversationId = data.conversationId;
  if (typeof conversationId === 'string' && conversationId.length > 0) {
    navigationRef.navigate('Conversation', { conversationId });
    return true;
  }

  const listingId = data.listingId;
  const category = data.category;
  if (
    typeof listingId === 'string' &&
    listingId.length > 0 &&
    (category === 'equipment' || category === 'services' || category === 'gold')
  ) {
    navigationRef.navigate('CompleteListingDetail', {
      id: listingId,
      category: category as ListingCategory,
    });
    return true;
  }

  return false;
}

function handleNotificationResponse(response: {
  notification: { request: { content: { data?: Record<string, unknown> } } };
}): void {
  const data = response.notification.request.content.data;
  if (navigateFromNotificationData(data)) return;

  const deepLink = data?.deepLink;
  if (typeof deepLink === 'string' && deepLink.length > 0) {
    openDeepLink(deepLink);
  }
}

// Sets up foreground/tap listeners for push notifications. Call once near
// the app root (see App.tsx). Registration (permission + token + backend
// call) is separate — triggered from authStore after login / session restore.
//
// `expo-notifications` is loaded dynamically here (never statically
// imported) because merely importing it throws on Android in Expo Go — see
// pushNotifications.ts.
export function usePushNotifications(): void {
  React.useEffect(() => {
    if (!isPushAvailable) return;

    let receivedSub: { remove(): void } | undefined;
    let responseSub: { remove(): void } | undefined;
    let cancelled = false;

    import('expo-notifications').then((Notifications) => {
      if (cancelled) return;

      Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowBanner: true,
          shouldShowList: true,
          shouldPlaySound: true,
          shouldSetBadge: false,
        }),
      });

      if (Platform.OS === 'android') {
        void Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.HIGH,
          vibrationPattern: [0, 250, 250, 250],
          sound: 'default',
        });
      }

      receivedSub = Notifications.addNotificationReceivedListener((notification) => {
        console.log('[push] Notification received in foreground', notification.request.content);
      });

      responseSub = Notifications.addNotificationResponseReceivedListener((response) => {
        handleNotificationResponse(response);
      });

      // Cold start: app launched by tapping a notification.
      void Notifications.getLastNotificationResponseAsync().then((response) => {
        if (cancelled || !response) return;
        // Wait until NavigationContainer is ready before navigating.
        const tryOpen = () => {
          if (cancelled) return;
          if (navigationRef.isReady()) {
            handleNotificationResponse(response);
            return;
          }
          requestAnimationFrame(tryOpen);
        };
        requestAnimationFrame(tryOpen);
      });
    });

    return () => {
      cancelled = true;
      receivedSub?.remove();
      responseSub?.remove();
    };
  }, []);
}
