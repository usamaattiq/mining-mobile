import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '@/shared/components/AppText';
import { palette, radius, spacing } from '@/theme';
import { cardBackShadow } from '@/theme/cardShadow';

type OfferChoiceCardProps = {
  selected: boolean;
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
  onPress: () => void;
  /** Match form field text (15) instead of the larger first-step title. */
  compact?: boolean;
};

/** Large selectable card for the first step of a listing — rent/sell or onsite/online. */
export function OfferChoiceCard({
  selected,
  icon,
  title,
  subtitle,
  onPress,
  compact = false,
}: OfferChoiceCardProps): React.ReactElement {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      accessibilityLabel={title}
      style={({ pressed }) => [
        styles.card,
        cardBackShadow,
        selected && styles.cardSelected,
        pressed && styles.pressed,
      ]}
    >
      <View style={[styles.iconWrap, selected && styles.iconWrapSelected]}>
        <Ionicons name={icon} size={26} color={selected ? palette.pureWhite : palette.gold} />
      </View>
      <View style={styles.copy}>
        <AppText weight="bold" style={[styles.title, compact && styles.titleCompact]}>
          {title}
        </AppText>
        <AppText style={styles.subtitle}>{subtitle}</AppText>
      </View>
      <View style={[styles.check, selected && styles.checkSelected]}>
        {selected ? <Ionicons name="checkmark" size={16} color={palette.pureWhite} /> : null}
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
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderColor: '#E7E1D6',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  cardSelected: {
    borderColor: palette.gold,
    backgroundColor: '#FFF9EE',
  },
  pressed: {
    opacity: 0.9,
  },
  iconWrap: {
    width: 56,
    height: 56,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.softGold,
  },
  iconWrapSelected: {
    backgroundColor: palette.gold,
  },
  copy: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontSize: 17,
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
  check: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#D9D3C7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkSelected: {
    borderColor: palette.gold,
    backgroundColor: palette.gold,
  },
});
