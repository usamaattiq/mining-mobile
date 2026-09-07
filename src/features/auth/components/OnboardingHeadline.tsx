import React from 'react';
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { palette, spacing } from '@/shared/theme/tokens';

type OnboardingHeadlineProps = {
  title: string;
  subtitle?: string;
  /** Gold-on-dark styling for the gradient hero header. */
  dark?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function OnboardingHeadline({
  title,
  subtitle,
  dark = false,
  style,
}: OnboardingHeadlineProps): React.ReactElement {
  return (
    <View style={[styles.block, style]}>
      <Text style={[styles.title, dark && styles.titleDark]}>{title}</Text>
      {subtitle ? (
        <Text style={[styles.subtitle, dark && styles.subtitleDark]}>{subtitle}</Text>
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
    fontWeight: '800',
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
