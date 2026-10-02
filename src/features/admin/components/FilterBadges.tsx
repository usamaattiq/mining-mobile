import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { AppText } from '@/shared/components/AppText';
import { palette, radius, spacing } from '@/theme';

export function FilterBadges<T extends string>({
  value,
  onChange,
  options,
}: {
  value: T;
  onChange: (id: T) => void;
  options: { id: T; label: string }[];
}): React.ReactElement {
  return (
    <View style={styles.row}>
      {options.map((option) => {
        const selected = option.id === value;
        return (
          <Pressable
            key={option.id}
            onPress={() => onChange(option.id)}
            style={[styles.badge, selected && styles.badgeSelected]}
          >
            <AppText weight="semibold" style={[styles.label, selected && styles.labelSelected]}>
              {option.label}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  badge: {
    borderRadius: radius.pill,
    backgroundColor: palette.softGold,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  badgeSelected: {
    backgroundColor: palette.gold,
  },
  label: {
    fontSize: 13,
    color: palette.goldDark,
  },
  labelSelected: {
    color: palette.pureWhite,
  },
});
