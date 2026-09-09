import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { palette, radius, spacing } from '@/shared/theme/tokens';
import { getFontFamily } from '@/shared/theme/typography';
import type { LanguageSwitcherTriggerProps } from './types/language-switcher.types';

// The short code (EN/AR) is always Latin — keep it in the Latin (Outfit)
// face regardless of active language so Cairo's different metrics don't
// nudge this small chip's layout.
const SHORT_LABEL_FONT = getFontFamily('en', 'semibold');

export function LanguageSwitcherTrigger({
  language,
  onPress,
}: LanguageSwitcherTriggerProps): React.ReactElement {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.trigger, pressed && styles.pressed]}
      accessibilityRole="button"
      accessibilityLabel={language.label}
    >
      <Text style={styles.flag}>{language.flag}</Text>
      <Text style={styles.label}>{language.shortLabel}</Text>
      <Ionicons name="chevron-down" size={12} color={palette.charcoal} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  trigger: {
    height: 32,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: palette.softGold,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    paddingHorizontal: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  pressed: {
    opacity: 0.7,
  },
  flag: {
    fontSize: 13,
  },
  label: {
    fontFamily: SHORT_LABEL_FONT,
    fontSize: 12,
    letterSpacing: 0.5,
    color: palette.charcoal,
  },
});
