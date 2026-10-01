import React from 'react';
import { StyleSheet, View } from 'react-native';
import { AppText } from '@/shared/components/AppText';
import { palette, spacing } from '@/theme';
import type { OnboardingHeadlineProps } from '@/features/auth/types/onboardingHeadline.types';

export function OnboardingHeadline({
  title,
  subtitle,
  dark = false,
  style,
}: OnboardingHeadlineProps): React.ReactElement {
  return (
    <View style={[styles.block, style]}>
      <AppText weight="bold" style={[styles.title, dark && styles.titleDark]}>
        {title}
      </AppText>
      {subtitle ? (
        <AppText style={[styles.subtitle, dark && styles.subtitleDark]}>{subtitle}</AppText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  block: {
    marginTop: spacing.md,
    gap: spacing.xs,
  },
  title: {
    fontSize: 26,
    lineHeight: 32,
    color: palette.charcoal,
  },
  titleDark: {
    color: palette.pureWhite,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
    color: palette.muted,
  },
  subtitleDark: {
    color: 'rgba(255, 255, 255, 0.82)',
  },
});
