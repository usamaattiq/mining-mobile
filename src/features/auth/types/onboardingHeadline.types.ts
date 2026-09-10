import type { StyleProp, ViewStyle } from 'react-native';

export type OnboardingHeadlineProps = {
  title: string;
  subtitle?: string;
  /** Gold-on-dark styling for the gradient hero header. */
  dark?: boolean;
  style?: StyleProp<ViewStyle>;
};
