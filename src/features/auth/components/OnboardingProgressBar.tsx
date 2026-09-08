import React from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { palette, radius, spacing } from '@/shared/theme/tokens';

type OnboardingProgressBarProps = {
  /** Total number of steps in the flow. */
  totalSteps: number;
  /** 0-based index of the current step. */
  currentStep: number;
};

export function OnboardingProgressBar({
  totalSteps,
  currentStep,
}: OnboardingProgressBarProps): React.ReactElement {
  const progress = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    const clamped = Math.min(Math.max(currentStep + 1, 0), totalSteps);
    Animated.timing(progress, {
      toValue: totalSteps > 0 ? clamped / totalSteps : 0,
      duration: 280,
      useNativeDriver: false,
    }).start();
  }, [currentStep, progress, totalSteps]);

  return (
    <View style={styles.track}>
      <Animated.View
        style={[
          styles.fill,
          {
            width: progress.interpolate({
              inputRange: [0, 1],
              outputRange: ['0%', '100%'],
            }),
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    width: '100%',
    height: 4,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(255, 255, 255, 0.35)',
    marginTop: spacing.md,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: radius.pill,
    backgroundColor: palette.pureWhite,
  },
});
