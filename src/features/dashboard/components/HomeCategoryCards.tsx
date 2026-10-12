import React, { useEffect } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { AppText } from '@/shared/components/AppText';
import { palette, radius, spacing } from '@/theme';
import type { HomeCategoryCardsProps } from '@/features/dashboard/types/homeCategoryCards.types';

/** Category picker in the Home gold header — illustrated cards with a title and short detail. */
export function HomeCategoryCards({
  heading,
  description,
  value,
  options,
  onChange,
}: HomeCategoryCardsProps): React.ReactElement {
  return (
    <View style={styles.wrap}>
      <View style={styles.copy}>
        <AppText weight="bold" style={styles.heading}>
          {heading}
        </AppText>
        <AppText style={styles.description}>{description}</AppText>
      </View>
      <View style={styles.row}>
        {options.map((option) => (
          <CategoryCard
            key={option.key}
            selected={option.key === value}
            title={option.title}
            subtitle={option.subtitle}
            icon={option.icon}
            onPress={() => onChange(option.key)}
          />
        ))}
      </View>
    </View>
  );
}

function CategoryCard({
  selected,
  title,
  subtitle,
  icon,
  onPress,
}: {
  selected: boolean;
  title: string;
  subtitle: string;
  icon: HomeCategoryCardsProps['options'][number]['icon'];
  onPress: () => void;
}): React.ReactElement {
  const scale = useSharedValue(selected ? 1 : 0.98);

  useEffect(() => {
    scale.value = withSpring(selected ? 1 : 0.98, { damping: 16, stiffness: 220 });
  }, [scale, selected]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={[styles.shadowWrap, selected && styles.shadowWrapSelected, animatedStyle]}>
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityState={{ selected }}
        accessibilityLabel={title}
        style={({ pressed }) => [
          styles.card,
          selected && styles.cardSelected,
          pressed && styles.pressed,
        ]}
      >
        <View style={[styles.iconWrap, selected && styles.iconWrapSelected]}>
          <Ionicons
            name={icon}
            size={22}
            color={selected ? palette.gold : palette.pureWhite}
          />
        </View>
        <AppText weight="bold" style={[styles.title, selected && styles.titleSelected]} numberOfLines={2}>
          {title}
        </AppText>
        <AppText style={[styles.subtitle, selected && styles.subtitleSelected]} numberOfLines={2}>
          {subtitle}
        </AppText>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: spacing.md,
  },
  copy: {
    gap: 4,
  },
  heading: {
    fontSize: 28,
    lineHeight: 34,
    color: palette.pureWhite,
  },
  description: {
    fontSize: 15,
    lineHeight: 21,
    color: 'rgba(255, 255, 255, 0.92)',
  },
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  shadowWrap: {
    flex: 1,
    minWidth: 0,
    borderRadius: radius.lg,
    backgroundColor: 'transparent',
  },
  shadowWrapSelected: {
    backgroundColor: palette.pureWhite,
    shadowColor: '#000000',
    shadowOpacity: 0.16,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 14,
    elevation: 6,
  },
  card: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.38)',
    paddingHorizontal: spacing.sm,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
    gap: 2,
    minHeight: 118,
  },
  cardSelected: {
    backgroundColor: palette.pureWhite,
    borderColor: palette.pureWhite,
  },
  pressed: {
    opacity: 0.88,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.16)',
  },
  iconWrapSelected: {
    backgroundColor: palette.softGold,
  },
  title: {
    fontSize: 15,
    lineHeight: 20,
    color: palette.pureWhite,
    textAlign: 'center',
  },
  titleSelected: {
    color: '#1C2430',
  },
  subtitle: {
    fontSize: 12,
    lineHeight: 16,
    color: 'rgba(255, 255, 255, 0.82)',
    textAlign: 'center',
  },
  subtitleSelected: {
    color: '#6B7280',
  },
});
