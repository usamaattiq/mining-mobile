import React from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { palette, radius, spacing } from '@/theme';
import { cardBackShadow } from '@/theme/cardShadow';
import type { PressableCardProps } from '@/shared/types/pressableCard.types';

export function PressableCard({
  onPress,
  accessibilityLabel,
  children,
  highlighted,
  style,
}: PressableCardProps): React.ReactElement {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      style={({ pressed }) => [
        styles.card,
        cardBackShadow,
        highlighted && styles.highlighted,
        pressed && styles.pressed,
        style,
      ]}
    >
      {children}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: palette.warmWhite,
    borderRadius: radius.lg,
    padding: spacing.md,
    flexDirection: 'row',
    gap: spacing.md,
    alignItems: 'center',
  },
  highlighted: {
    backgroundColor: palette.softGold,
  },
  pressed: {
    opacity: 0.9,
  },
});
