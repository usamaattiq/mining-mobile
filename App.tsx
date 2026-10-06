import React from 'react';
import { DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'react-native';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import {
  KeyboardProvider,
  KeyboardToolbar,
  useKeyboardState,
} from 'react-native-keyboard-controller';
import { initialWindowMetrics, SafeAreaProvider } from 'react-native-safe-area-context';
import { AppNavigator } from '@/navigation/AppNavigator';
import { AppAlertHost } from '@/shared/components/AppAlertHost';
import { navigationRef } from '@/navigation/navigationRef';
import { navigationLinking } from '@/navigation/linking';
import { initializeI18n } from '@/i18n';
import { appFontAssets, palette } from '@/theme';
import { usePushNotifications } from '@/shared/hooks/usePushNotifications';
import { useChatRealtime } from '@/shared/hooks/useChatRealtime';
import { registerForPushNotifications } from '@/shared/services/pushNotifications';
import { useAuthStore } from '@/store/authStore';
import { useDevicePrefsStore } from '@/store/devicePrefsStore';
import { useMarketplaceRoleStore } from '@/store/marketplaceRoleStore';
import { useProfileStore } from '@/store/profileStore';
import { authApi } from '@/features/auth/api/authApi';

void SplashScreen.preventAutoHideAsync();

const NUMBER_KEYBOARDS = new Set(['numeric', 'number-pad', 'decimal-pad', 'phone-pad']);

/** Number pads have no return key, so Done is shown only for those keyboards. */
function NumericKeyboardToolbar(): React.ReactElement | null {
  const keyboardType = useKeyboardState((state) => state.type);
  const [routeName, setRouteName] = React.useState<string | undefined>();

  React.useEffect(() => {
    let unsubscribe: (() => void) | undefined;
    let raf = 0;
    let cancelled = false;

    const sync = () => {
      setRouteName(navigationRef.getCurrentRoute()?.name);
    };

    const attach = (): boolean => {
      if (!navigationRef.isReady()) return false;
      sync();
      unsubscribe = navigationRef.addListener('state', sync);
      return true;
    };

    if (!attach()) {
      const wait = () => {
        if (cancelled) return;
        if (attach()) return;
        raf = requestAnimationFrame(wait);
      };
      raf = requestAnimationFrame(wait);
    }

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      unsubscribe?.();
    };
  }, []);

  // Offer composer already has Send; skip the Done toolbar on listing detail.
  if (routeName === 'CompleteListingDetail') return null;
  if (!NUMBER_KEYBOARDS.has(keyboardType)) return null;
  return <KeyboardToolbar />;
}

const navigationTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: palette.warmWhite,
  },
};

export default function App() {
  const [isI18nReady, setIsI18nReady] = React.useState(false);
  const [isStoresReady, setIsStoresReady] = React.useState(false);
  const [fontsLoaded, fontError] = useFonts(appFontAssets);
  const isReady = isI18nReady && isStoresReady && (fontsLoaded || Boolean(fontError));

  React.useEffect(() => {
    void Promise.all([
      useAuthStore.getState().hydrate(),
      useDevicePrefsStore.getState().hydrate(),
      useMarketplaceRoleStore.getState().hydrate(),
    ])
      .then(async () => {
        // A persisted token alone isn't enough to trust the session — confirm it
        // against the server and load the profile, or drop it if it's stale/revoked.
        if (useAuthStore.getState().status === 'authenticated') {
          try {
            const profile = await authApi.getMe();
            useProfileStore.getState().setProfile(profile);
            void registerForPushNotifications();
          } catch {
            await useAuthStore.getState().clear();
          }
        }
      })
      .then(() => setIsStoresReady(true));
  }, []);

  // Listens for foreground/tapped notifications for the whole app lifetime.
  // Actual registration (permission + token + backend call) happens after
  // login, once auth exists — see registerForPushNotifications().
  usePushNotifications();
  useChatRealtime();

  React.useEffect(() => {
    let cancelled = false;
    void initializeI18n().then(() => {
      if (!cancelled) setIsI18nReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  React.useEffect(() => {
    if (isReady) {
      void SplashScreen.hideAsync();
    }
  }, [isReady]);

  if (!isReady) {
    return null;
  }

  return (
    <SafeAreaProvider initialMetrics={initialWindowMetrics}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <KeyboardProvider statusBarTranslucent navigationBarTranslucent>
        <NavigationContainer
          ref={navigationRef}
          linking={navigationLinking}
          theme={navigationTheme}
        >
          <AppNavigator />
        </NavigationContainer>
        <NumericKeyboardToolbar />
        <AppAlertHost />
      </KeyboardProvider>
    </SafeAreaProvider>
  );
}
