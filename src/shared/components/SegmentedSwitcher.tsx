import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { AppText } from '@/shared/components/AppText';
import { BlinkingDot } from '@/shared/components/BlinkingDot';
import { useSlidingPill } from '@/shared/hooks/useSlidingPill';
import { palette, radius, spacing } from '@/theme';
import type { SegmentedSwitcherProps } from '@/shared/types/segmentedSwitcher.types';

/** Equal-width pill segmented control with an animated sliding active indicator. */
export function SegmentedSwitcher<T extends string>({
  value,
  onChange,
  options,
}: SegmentedSwitcherProps<T>): React.ReactElement {
  const { onItemLayout, pillStyle } = useSlidingPill(value);

  return (
    <View style={styles.track}>
      <Animated.View pointerEvents="none" style={[styles.pill, pillStyle]} />
      {options.map((option) => {
        const selected = option.key === value;
        return (
          <Pressable
            key={option.key}
            onPress={() => onChange(option.key)}
            onLayout={(event) => onItemLayout(option.key, event)}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            style={styles.segment}
          >
            <View style={styles.labelWrap}>
              <AppText
                weight={selected ? 'bold' : 'medium'}
                style={[styles.label, selected && styles.labelSelected]}
                numberOfLines={1}
              >
                {option.label}
              </AppText>
              {option.alert ? <BlinkingDot style={styles.alert} /> : null}
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    flexDirection: 'row',
    backgroundColor: palette.softGold,
    borderRadius: radius.pill,
    padding: 4,
  },
  pill: {
    position: 'absolute',
    left: 0,
    top: 4,
    bottom: 4,
    borderRadius: radius.pill,
    backgroundColor: palette.gold,
  },
  segment: {
    flex: 1,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.sm,
  },
  labelWrap: {
    position: 'relative',
  },
  alert: {
    position: 'absolute',
    top: -3,
    end: -7,
    width: 8,
    height: 8,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: palette.pureWhite,
  },
  label: {
    fontSize: 13,
    color: palette.charcoal,
  },
  labelSelected: {
    color: palette.pureWhite,
  },
});
