import React from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { palette } from '@/theme';

const COLORS = [
  palette.gold,
  palette.lightGold,
  palette.softGold,
  palette.charcoal,
  palette.pureWhite,
  '#4CAF50',
  '#E85D75',
];

const PIECE_COUNT = 52;

function randomBetween(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

function ConfettiPiece({
  screenWidth,
  screenHeight,
  index,
}: {
  screenWidth: number;
  screenHeight: number;
  index: number;
}): React.ReactElement {
  const startX = React.useMemo(() => randomBetween(0, screenWidth), [screenWidth]);
  const size = React.useMemo(() => randomBetween(5, 10), []);
  const color = React.useMemo(() => COLORS[Math.floor(Math.random() * COLORS.length)], []);
  const fallDuration = React.useMemo(() => randomBetween(3200, 5600), []);
  const swayDuration = React.useMemo(() => randomBetween(1200, 2200), []);
  const spinDuration = React.useMemo(() => randomBetween(1600, 3200), []);
  const startDelay = React.useMemo(
    () => (index / PIECE_COUNT) * 2800 + randomBetween(0, 800),
    [index],
  );
  const swayRange = React.useMemo(() => randomBetween(12, 32), []);
  const opacity = React.useMemo(() => randomBetween(0.55, 1), []);

  const fall = useSharedValue(0);
  const sway = useSharedValue(0);
  const spin = useSharedValue(0);

  React.useEffect(() => {
    fall.value = withDelay(
      startDelay,
      withRepeat(
        withTiming(1, { duration: fallDuration, easing: Easing.out(Easing.quad) }),
        -1,
        false,
      ),
    );
    sway.value = withDelay(
      startDelay * 0.2,
      withRepeat(
        withTiming(1, { duration: swayDuration, easing: Easing.inOut(Easing.sin) }),
        -1,
        true,
      ),
    );
    spin.value = withDelay(
      startDelay * 0.15,
      withRepeat(withTiming(1, { duration: spinDuration, easing: Easing.linear }), -1, false),
    );
  }, [fall, fallDuration, spin, spinDuration, startDelay, sway, swayDuration]);

  const style = useAnimatedStyle(() => {
    const translateY = fall.value * (screenHeight + 60) - 60;
    const translateX = (sway.value - 0.5) * swayRange;
    const rotate = `${spin.value * 360}deg`;
    return {
      opacity,
      transform: [{ translateX }, { translateY }, { rotate }],
    };
  });

  return (
    <Animated.View
      style={[
        styles.piece,
        {
          left: startX,
          width: size,
          height: size * 1.6,
          backgroundColor: color,
        },
        style,
      ]}
    />
  );
}

export function Confetti(): React.ReactElement {
  const { width, height } = useWindowDimensions();

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {Array.from({ length: PIECE_COUNT }).map((_, index) => (
        <ConfettiPiece key={index} index={index} screenWidth={width} screenHeight={height} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  piece: {
    position: 'absolute',
    top: 0,
    borderRadius: 2,
  },
});
