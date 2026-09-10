import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '@/shared/components/AppText';
import { palette, radius, spacing } from '@/theme';
import { cardBackShadow } from '@/theme/cardShadow';
import type { ListingModeCardProps } from '@/features/listings/types/listingModeCard.types';

/** Large tappable card used to pick Rent vs Sell on the equipment listing mode screen. */
export function ListingModeCard({
  icon,
  title,
  subtitle,
  onPress,
}: ListingModeCardProps): React.ReactElement {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={title}
      style={({ pressed }) => [styles.card, cardBackShadow, pressed && styles.pressed]}
    >
      <View style={styles.iconWrap}>
        <Ionicons name={icon} size={32} color={palette.pureWhite} />
      </View>
      <AppText weight="bold" style={styles.title}>
        {title}
      </AppText>
      <AppText style={styles.subtitle}>{subtitle}</AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    alignItems: 'flex-start',
    gap: spacing.sm,
    backgroundColor: palette.pureWhite,
    borderRadius: radius.lg,
    padding: spacing.lg,
    minHeight: 160,
  },
  pressed: {
    opacity: 0.9,
  },
  iconWrap: {
    width: 56,
    height: 56,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.gold,
  },
  title: {
    fontSize: 17,
    color: palette.charcoal,
  },
  subtitle: {
    fontSize: 13,
    lineHeight: 18,
    color: palette.muted,
  },
});
