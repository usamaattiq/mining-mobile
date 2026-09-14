import type { ReactNode } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';

export type PressableCardProps = {
  onPress: () => void;
  accessibilityLabel: string;
  children: ReactNode;
  highlighted?: boolean;
  style?: StyleProp<ViewStyle>;
};
