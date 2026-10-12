import React from 'react';
import { Animated, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import { palette } from '@/theme';

export function BlinkingDot({
  style,
}: {
  style?: StyleProp<ViewStyle>;
}): React.ReactElement {
  const opacity = React.useRef(new Animated.Value(1)).current;

  React.useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0.2, duration: 550, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 1, duration: 550, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [opacity]);

  return <Animated.View style={[styles.dot, { opacity }, style]} />;
}

const styles = StyleSheet.create({
  dot: {
    width: 10,
    height: 10,
    borderRadius: 6,
    backgroundColor: palette.gold,
  },
});
