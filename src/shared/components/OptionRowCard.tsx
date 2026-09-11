import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '@/shared/components/AppText';
import { palette, radius, spacing } from '@/theme';
import { cardBackShadow } from '@/theme/cardShadow';
import type { OptionRowCardProps } from '@/shared/types/optionRowCard.types';

/** Bold, gradient-icon full-width row card used for a small set of tappable choices (e.g. Rent/Sell, Onsite/Online, quick-create). */
export function OptionRowCard({
  icon,
  title,
  subtitle,
  onPress,
}: OptionRowCardProps): React.ReactElement {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={title}
      style={({ pressed }) => [styles.card, cardBackShadow, pressed && styles.pressed]}
    >
      <LinearGradient
        colors={[palette.lightGold, palette.gold, palette.goldDark]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.iconWrap}
      >
        <Ionicons name={icon} size={30} color={palette.pureWhite} />
      </LinearGradient>

      <View style={styles.copy}>
        <AppText weight="bold" style={styles.title}>
          {title}
        </AppText>
        <AppText style={styles.subtitle}>{subtitle}</AppText>
      </View>

      <View style={styles.chevronWrap}>
        <Ionicons name="chevron-forward" size={20} color={palette.gold} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: palette.pureWhite,
    borderRadius: radius.lg + 4,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
  },
  pressed: {
    opacity: 0.92,
    backgroundColor: palette.softGold,
  },
  iconWrap: {
    width: 64,
    height: 64,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  copy: {
    flex: 1,
    gap: 3,
  },
  title: {
    fontSize: 18,
    color: palette.charcoal,
  },
  subtitle: {
    fontSize: 13,
    lineHeight: 18,
    color: palette.muted,
  },
  chevronWrap: {
    width: 32,
    height: 32,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.softGold,
  },
});
