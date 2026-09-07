import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar, StyleSheet, View } from 'react-native';
import { initialWindowMetrics, SafeAreaProvider } from 'react-native-safe-area-context';
import { SplashScreen } from '@/shared/components/SplashScreen';
import { AppNavigator } from '@/navigation/AppNavigator';
import { navigationRef } from '@/navigation/navigationRef';
import { palette } from '@/shared/theme/tokens';
import { usePushNotifications } from '@/shared/hooks/usePushNotifications';

const BOOTSTRAP_DELAY_MS = 800;

export default function App() {
  const [isReady, setIsReady] = React.useState(false);

  // Listens for foreground/tapped notifications for the whole app lifetime.
  // Actual registration (permission + token + backend call) happens after
  // login, once auth exists — see registerForPushNotifications().
  usePushNotifications();

  React.useEffect(() => {
    const timer = setTimeout(() => setIsReady(true), BOOTSTRAP_DELAY_MS);
    return () => clearTimeout(timer);
  }, []);

  if (!isReady) {
    return (
      <SafeAreaProvider initialMetrics={initialWindowMetrics}>
        <SplashScreen showLoader />
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider initialMetrics={initialWindowMetrics}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      <View style={styles.root}>
        <NavigationContainer ref={navigationRef}>
          <AppNavigator />
        </NavigationContainer>
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: palette.warmWhite,
  },
});
