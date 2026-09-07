import React from 'react';
import { Linking } from 'react-native';
import { isPushAvailable } from '@/shared/services/pushNotifications';

// Sets up foreground/tap listeners for push notifications. Call once near
// the app root (see App.tsx). Registration (permission + token + backend
// call) is separate — trigger `registerForPushNotifications()` after login,
// since it needs an authenticated user.
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

      receivedSub = Notifications.addNotificationReceivedListener((notification) => {
        console.log('[push] Notification received in foreground', notification.request.content);
      });

      responseSub = Notifications.addNotificationResponseReceivedListener((response) => {
        const deepLink = response.notification.request.content.data?.deepLink;
        if (typeof deepLink === 'string' && deepLink.length > 0) {
          Linking.openURL(deepLink).catch((error) => {
            console.error('[push] Failed to open deep link from notification', error);
          });
        }
      });
    });

    return () => {
      cancelled = true;
      receivedSub?.remove();
      responseSub?.remove();
    };
  }, []);
}
