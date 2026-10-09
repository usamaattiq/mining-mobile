import React from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

type FadeInProps = {
  children: React.ReactNode;
  delay?: number;
  style?: StyleProp<ViewStyle>;
};

/** One short entrance. Use on screens and empty states, not on long scrolling lists. */
export function FadeIn({ children, delay = 0, style }: FadeInProps): React.ReactElement {
  return (
    <Animated.View entering={FadeInDown.duration(380).delay(delay)} style={style}>
      {children}
    </Animated.View>
  );
}
