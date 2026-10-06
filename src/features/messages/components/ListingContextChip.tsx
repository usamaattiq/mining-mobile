import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '@/shared/components/AppText';
import { palette, radius, spacing } from '@/theme';
import type { ListingCategory } from '@/navigation/types';
import type { TranslateFn } from '@/shared/types/translate.types';

const CONTEXT_THEME: Record<
  ListingCategory,
  {
    soft: string;
    text: string;
    icon: React.ComponentProps<typeof Ionicons>['name'];
  }
> = {
  equipment: {
    soft: palette.softGold,
    text: palette.gold,
    icon: 'construct-outline',
  },
  services: {
    soft: '#E8F0E4',
    text: '#5A7A4A',
    icon: 'briefcase-outline',
  },
  gold: {
    soft: '#F5E8D0',
    text: palette.goldDark,
    icon: 'hammer-outline',
  },
};

function categoryLabel(category: ListingCategory, t: TranslateFn): string {
  if (category === 'equipment') return t('requests.categoryEquipment');
  if (category === 'services') return t('requests.categoryServices');
  return t('requests.categoryGold');
}

type ListingContextChipProps = {
  title: string;
  category: ListingCategory;
  t: TranslateFn;
  onPress?: () => void;
  /** Extra padding when the chip sits in the gold conversation header. */
  inHeader?: boolean;
};

/** Shared listing chip used on inbox cards and the conversation header. */
export function ListingContextChip({
  title,
  category,
  t,
  onPress,
  inHeader = false,
}: ListingContextChipProps): React.ReactElement {
  const theme = CONTEXT_THEME[category] ?? CONTEXT_THEME.equipment;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      onPress={onPress}
      disabled={!onPress}
      style={({ pressed }) => [
        styles.context,
        inHeader && styles.contextInHeader,
        { backgroundColor: theme.soft },
        pressed && styles.contextPressed,
      ]}
    >
      <View style={styles.contextIconWrap}>
        <Ionicons name={theme.icon} size={12} color={theme.text} />
      </View>
      <View style={styles.contextCopy}>
        <AppText
          weight="semibold"
          style={[styles.contextTitle, { color: theme.text }]}
          numberOfLines={1}
        >
          {title}
        </AppText>
        <AppText style={styles.contextSubtitle} numberOfLines={1}>
          {categoryLabel(category, t)}
        </AppText>
      </View>
      <Ionicons name="chevron-forward" size={12} color={palette.muted} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  context: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: 2,
    paddingVertical: 4,
    paddingHorizontal: spacing.xs,
    borderRadius: radius.md,
  },
  contextInHeader: {
    marginTop: 0,
    marginHorizontal: spacing.md,
    marginBottom: spacing.xl,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
  },
  contextPressed: {
    opacity: 0.85,
  },
  contextIconWrap: {
    width: 24,
    height: 24,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.pureWhite,
  },
  contextCopy: {
    flex: 1,
    minWidth: 0,
    gap: 0,
  },
  contextTitle: {
    fontSize: 12,
    lineHeight: 15,
  },
  contextSubtitle: {
    fontSize: 10,
    lineHeight: 13,
    color: palette.muted,
  },
});
