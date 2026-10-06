import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '@/shared/components/AppText';
import { palette, radius, spacing } from '@/theme';
import type { HomeCategoryCardsProps } from '@/features/dashboard/types/homeCategoryCards.types';

/** Icon category picker for the Home gold header — Equipment, Services, Gold. */
export function HomeCategoryCards({
  value,
  options,
  onChange,
}: HomeCategoryCardsProps): React.ReactElement {
  return (
    <View style={styles.row}>
      {options.map((option) => {
        const selected = option.key === value;
        return (
          <View key={option.key} style={[styles.shadowWrap, selected && styles.shadowWrapSelected]}>
            <Pressable
              onPress={() => onChange(option.key)}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              accessibilityLabel={option.title}
              style={({ pressed }) => [
                styles.card,
                selected && styles.cardSelected,
                pressed && styles.pressed,
              ]}
            >
              <View style={[styles.iconWrap, selected && styles.iconWrapSelected]}>
                <Ionicons
                  name={option.icon}
                  size={24}
                  color={selected ? palette.gold : palette.pureWhite}
                />
              </View>
              <AppText
                weight="bold"
                style={[styles.title, selected && styles.titleSelected]}
                numberOfLines={1}
              >
                {option.title}
              </AppText>
            </Pressable>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  shadowWrap: {
    flex: 1,
    minWidth: 0,
    borderRadius: radius.lg,
    backgroundColor: palette.gold,
    shadowColor: '#000000',
    shadowOpacity: 0.18,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 12,
    elevation: 6,
  },
  shadowWrapSelected: {
    backgroundColor: palette.warmWhite,
  },
  card: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.16)',
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.28)',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.md,
    gap: 6,
    overflow: 'hidden',
  },
  cardSelected: {
    backgroundColor: palette.warmWhite,
    borderColor: palette.warmWhite,
  },
  pressed: {
    opacity: 0.88,
  },
  iconWrap: {
    width: 46,
    height: 46,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
  },
  iconWrapSelected: {
    backgroundColor: palette.softGold,
  },
  title: {
    fontSize: 13,
    color: palette.pureWhite,
    textAlign: 'center',
  },
  titleSelected: {
    color: palette.goldDark,
  },
});
