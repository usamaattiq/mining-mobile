import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { i18n as appI18n } from '@/i18n';
import type { RootStackParamList } from '@/navigation/types';
import { Confetti } from '@/features/auth/components/Confetti';
import { AppText } from '@/shared/components/AppText';
import { palette, radius, spacing } from '@/theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Welcome'>;

const CONTINUE_DELAY_MS = 5000;

export function WelcomeScreen({ navigation }: Props): React.ReactElement {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation(undefined, { i18n: appI18n });
  const [continuing, setContinuing] = React.useState(false);
  const progress = useSharedValue(0);

  const handleContinue = React.useCallback(() => {
    setContinuing(true);
    navigation.reset({ index: 0, routes: [{ name: 'Dashboard' }] });
  }, [navigation]);

  React.useEffect(() => {
    progress.value = withTiming(1, { duration: CONTINUE_DELAY_MS, easing: Easing.linear });
    const timer = setTimeout(handleContinue, CONTINUE_DELAY_MS);
    return () => clearTimeout(timer);
  }, [handleContinue, progress]);

  const progressBarStyle = useAnimatedStyle(() => ({
    width: `${progress.value * 100}%`,
  }));

  return (
    <View
      style={[
        styles.root,
        { paddingTop: insets.top + spacing.xl, paddingBottom: insets.bottom + spacing.xl },
      ]}
    >
      <Confetti />

      <View style={styles.content}>
        <View style={styles.iconCircle}>
          <Ionicons name="checkmark" size={40} color={palette.pureWhite} />
        </View>
        <AppText weight="bold" style={[styles.title, styles.titleSpacing]}>
          {t('welcome.title')}
        </AppText>
        <AppText style={styles.subtitle}>{t('welcome.subtitle')}</AppText>

        <Pressable
          style={styles.continueButton}
          onPress={handleContinue}
          disabled={continuing}
          accessibilityRole="button"
          accessibilityLabel={t('welcome.continue')}
        >
          <Animated.View style={[styles.continueProgress, progressBarStyle]} />
          <AppText weight="bold" style={styles.continueLabel}>
            {t('welcome.continue')}
          </AppText>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: palette.pureWhite,
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
  },
  iconCircle: {
    width: 88,
    height: 88,
    borderRadius: radius.pill,
    backgroundColor: palette.gold,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  title: {
    fontSize: 24,
    color: palette.charcoal,
    textAlign: 'center',
  },
  titleSpacing: {
    marginBottom: -spacing.sm,
  },
  subtitle: {
    fontSize: 14,
    color: palette.muted,
    textAlign: 'center',
    maxWidth: '85%',
    marginBottom: spacing.md,
  },
  continueButton: {
    alignSelf: 'stretch',
    height: 52,
    borderRadius: radius.pill,
    backgroundColor: palette.gold,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  continueProgress: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: palette.goldDark,
  },
  continueLabel: {
    fontSize: 15,
    color: palette.pureWhite,
  },
});
