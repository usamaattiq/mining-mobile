import React from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { palette, radius, spacing } from '@/shared/theme/tokens';

export type OnboardingStep = {
  key: string;
  label: string;
};

type OnboardingStepperProps = {
  steps: OnboardingStep[];
  currentStep: number;
};

const DOT_SIZE = 26;

export function OnboardingStepper({
  steps,
  currentStep,
}: OnboardingStepperProps): React.ReactElement {
  const segmentCount = Math.max(steps.length - 1, 1);
  const progress = React.useRef(new Animated.Value(0)).current;
  const [trackWidth, setTrackWidth] = React.useState(0);

  React.useEffect(() => {
    const clamped = Math.min(Math.max(currentStep, 0), steps.length - 1);
    Animated.timing(progress, {
      toValue: clamped / segmentCount,
      duration: 280,
      useNativeDriver: false,
    }).start();
  }, [currentStep, progress, segmentCount, steps.length]);

  return (
    <View style={styles.root}>
      <View
        style={styles.trackWrap}
        onLayout={(e) => setTrackWidth(e.nativeEvent.layout.width)}
      >
        <View style={styles.track} />
        <Animated.View
          style={[
            styles.trackFill,
            {
              width: progress.interpolate({
                inputRange: [0, 1],
                outputRange: [0, trackWidth],
              }),
            },
          ]}
        />
        <View style={styles.stepsRow}>
          {steps.map((step, index) => {
            const isCompleted = index < currentStep;
            const isActive = index === currentStep;
            const filled = isCompleted || isActive;

            return (
              <View
                key={step.key}
                style={[
                  styles.dot,
                  filled && styles.dotFilled,
                  isActive && styles.dotActive,
                ]}
              >
                {isCompleted ? (
                  <Ionicons name="checkmark" size={14} color={palette.pureWhite} />
                ) : null}
              </View>
            );
          })}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    width: '100%',
    marginTop: spacing.md,
  },
  trackWrap: {
    justifyContent: 'center',
    height: DOT_SIZE,
    width: '100%',
  },
  track: {
    position: 'absolute',
    left: DOT_SIZE / 2,
    right: DOT_SIZE / 2,
    height: 2,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(255, 255, 255, 0.35)',
  },
  trackFill: {
    position: 'absolute',
    left: DOT_SIZE / 2,
    height: 2,
    borderRadius: radius.pill,
    backgroundColor: palette.pureWhite,
  },
  stepsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  dot: {
    width: DOT_SIZE,
    height: DOT_SIZE,
    borderRadius: DOT_SIZE / 2,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotFilled: {
    backgroundColor: palette.charcoal,
    borderColor: palette.pureWhite,
  },
  dotActive: {
    borderColor: palette.pureWhite,
  },
});
