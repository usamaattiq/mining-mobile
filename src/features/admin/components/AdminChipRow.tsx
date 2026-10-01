import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '@/shared/components/AppText';
import { palette, radius, spacing } from '@/theme';

type Tile = {
  id: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
};

/** Same gold-header tiles as Home: frosted icon card, cream when selected. */
export function AdminChipRow({
  options,
  value,
  onChange,
}: {
  options: Tile[];
  value: string;
  onChange: (id: string) => void;
}): React.ReactElement {
  return (
    <View style={styles.row}>
      {options.map((option) => {
        const selected = option.id === value;
        return (
          <View key={option.id} style={[styles.shadowWrap, selected && styles.shadowWrapSelected]}>
            <Pressable
              onPress={() => onChange(option.id)}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              accessibilityLabel={option.label}
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
                {option.label}
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
