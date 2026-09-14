import React from 'react';
import { DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { StatusBar, StyleSheet, View } from 'react-native';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { initialWindowMetrics, SafeAreaProvider } from 'react-native-safe-area-context';
import { AppNavigator } from '@/navigation/AppNavigator';
import { AppAlertHost } from '@/shared/components/AppAlertHost';
import { navigationRef } from '@/navigation/navigationRef';
import { initializeI18n } from '@/i18n';
import { appFontAssets, palette } from '@/theme';
import { usePushNotifications } from '@/shared/hooks/usePushNotifications';
import { useAuthStore } from '@/store/authStore';
import { useDevicePrefsStore } from '@/store/devicePrefsStore';
import { useMarketplaceRoleStore } from '@/store/marketplaceRoleStore';
import { useProfileStore } from '@/store/profileStore';
import { authApi } from '@/features/auth/api/authApi';

void SplashScreen.preventAutoHideAsync();

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
      <KeyboardProvider statusBarTranslucent>
        <View style={styles.root}>
          <NavigationContainer ref={navigationRef} theme={navigationTheme}>
            <AppNavigator />
          </NavigationContainer>
          <AppAlertHost />
        </View>
      </KeyboardProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: palette.warmWhite,
  },
});
