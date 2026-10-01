import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '@/shared/components/AppText';
import { palette, radius, spacing } from '@/theme';
import { cardBackShadow } from '@/theme/cardShadow';
import type { HomeActionCardProps } from '@/features/dashboard/types/homeActionCard.types';

/** Attractive elevated action card used in a stack on the Home screen — icon, title, and a short detail. */
export function HomeActionCard({
  icon,
  title,
  subtitle,
  onPress,
}: HomeActionCardProps): React.ReactElement {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={title}
      style={({ pressed }) => [styles.card, cardBackShadow, pressed && styles.pressed]}
    >
      <View style={styles.iconWrap}>
        <Ionicons name={icon} size={26} color={palette.pureWhite} />
      </View>
      <View style={styles.copy}>
        <AppText weight="bold" style={styles.title}>
          {title}
        </AppText>
        <AppText style={styles.subtitle} numberOfLines={1}>
          {subtitle}
        </AppText>
      </View>
      <View style={styles.chevronWrap}>
        <Ionicons name="chevron-forward" size={18} color={palette.gold} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: palette.warmWhite,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  pressed: {
    opacity: 0.9,
  },
  iconWrap: {
    width: 52,
    height: 52,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.gold,
  },
  copy: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontSize: 16,
    color: palette.charcoal,
  },
  subtitle: {
    fontSize: 12,
    lineHeight: 16,
    color: palette.muted,
  },
  chevronWrap: {
    width: 28,
    height: 28,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.softGold,
  },
});
