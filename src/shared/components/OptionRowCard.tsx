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
  selected = false,
  compact = false,
}: OptionRowCardProps): React.ReactElement {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      accessibilityLabel={title}
      style={({ pressed }) => [
        styles.card,
        compact && styles.cardCompact,
        selected && styles.cardSelected,
        cardBackShadow,
        pressed && styles.pressed,
      ]}
    >
      <View style={[styles.heading, compact && styles.headingCompact]}>
        <LinearGradient
          colors={[palette.lightGold, palette.gold, palette.goldDark]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.iconWrap, compact && styles.iconWrapCompact]}
        >
          <Ionicons name={icon} size={compact ? 22 : 30} color={palette.pureWhite} />
        </LinearGradient>

        <View style={styles.copy}>
          <AppText weight="bold" style={[styles.title, compact && styles.titleCompact]}>
            {title}
          </AppText>
          {compact || !subtitle ? null : <AppText style={styles.subtitle}>{subtitle}</AppText>}
        </View>

        {compact ? (
          selected ? (
            <Ionicons name="checkmark-circle" size={20} color={palette.gold} />
          ) : (
            <View style={styles.radio} />
          )
        ) : (
          <View style={styles.chevronWrap}>
            <Ionicons
              name={selected ? 'checkmark' : 'chevron-forward'}
              size={20}
              color={palette.gold}
            />
          </View>
        )}
      </View>

      {compact && subtitle ? <AppText style={styles.subtitleCompact}>{subtitle}</AppText> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.md,
    backgroundColor: palette.warmWhite,
    borderRadius: radius.lg + 4,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  cardCompact: {
    flex: 1,
    minWidth: 0,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    borderRadius: radius.lg,
    gap: spacing.sm,
  },
  heading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  headingCompact: {
    gap: spacing.sm,
    alignItems: 'center',
  },
  cardSelected: {
    borderColor: palette.gold,
    backgroundColor: palette.softGold,
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
  iconWrapCompact: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
  },
  copy: {
    flex: 1,
    gap: 3,
  },
  title: {
    fontSize: 18,
    color: palette.charcoal,
  },
  titleCompact: {
    fontSize: 15,
  },
  subtitle: {
    fontSize: 13,
    lineHeight: 18,
    color: palette.muted,
  },
  subtitleCompact: {
    fontSize: 11,
    lineHeight: 15,
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
  radio: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: palette.softGold,
  },
});
