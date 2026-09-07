import React from 'react';
import { ActivityIndicator, StatusBar, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { palette, spacing } from '@/shared/theme/tokens';

// Plain RN Text on purpose: this screen renders before i18n/fonts finish
// loading, so it can't depend on AppText (which needs the language context).

type SplashScreenProps = {
  /** When true, show the loading spinner + label (bootstrap gate). */
  showLoader?: boolean;
};

/** First-paint branded splash shown while the app bootstraps. */
export function SplashScreen({ showLoader = true }: SplashScreenProps): React.ReactElement {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <View style={[styles.brandBlock, { paddingTop: Math.max(insets.top, spacing.lg) }]}>
        <View style={styles.logoCircle}>
          <Text style={styles.logoLetter}>M</Text>
        </View>
        <Text style={styles.title}>MINING MOBILE</Text>
      </View>

      {showLoader ? (
        <View style={[styles.loaderBlock, { paddingBottom: Math.max(insets.bottom, spacing.lg) }]}>
          <ActivityIndicator color={palette.gold} size="large" />
          <Text style={styles.loadingLabel}>Loading...</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: palette.charcoal,
    justifyContent: 'space-between',
  },
  brandBlock: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
  },
  logoCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: palette.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoLetter: {
    fontSize: 40,
    fontWeight: '700',
    color: palette.charcoal,
  },
  title: {
    fontSize: 16,
    letterSpacing: 2,
    fontWeight: '600',
    color: palette.pureWhite,
  },
  loaderBlock: {
    alignItems: 'center',
    gap: spacing.sm,
    paddingTop: spacing.lg,
  },
  loadingLabel: {
    fontSize: 13,
    color: palette.muted,
  },
});
