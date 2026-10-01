import { useCallback, useEffect, useRef } from 'react';
import type { LayoutChangeEvent } from 'react-native';
import {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';

export const SLIDING_PILL_TIMING = {
  duration: 260,
  easing: Easing.out(Easing.cubic),
};

type PillLayout = { x: number; y: number; width: number; height: number };

/** Measures segment layouts by id and animates a pill to slide/resize onto the selected one. */
export function useSlidingPill(selectedId: string) {
  const layouts = useRef<Record<string, PillLayout>>({});
  const translateX = useSharedValue(0);
  const width = useSharedValue(0);
  const visible = useSharedValue(0);

  const moveTo = useCallback(
    (layout: PillLayout, animate: boolean) => {
      const run = (sv: SharedValue<number>, value: number) => {
        sv.value = animate && visible.value === 1 ? withTiming(value, SLIDING_PILL_TIMING) : value;
      };
      run(translateX, layout.x);
      run(width, layout.width);
      visible.value = 1;
    },
    [translateX, visible, width],
  );

  const onItemLayout = useCallback(
    (id: string, event: LayoutChangeEvent) => {
      const { x, y, width: nextWidth, height: nextHeight } = event.nativeEvent.layout;
      const layout = { x, y, width: nextWidth, height: nextHeight };
      layouts.current[id] = layout;
      if (id === selectedId) {
        moveTo(layout, true);
      }
    },
    [moveTo, selectedId],
  );

  useEffect(() => {
    const layout = layouts.current[selectedId];
    if (layout) moveTo(layout, true);
  }, [moveTo, selectedId]);

  const pillStyle = useAnimatedStyle(() => ({
    opacity: visible.value,
    width: width.value,
    transform: [{ translateX: translateX.value }],
  }));

  return { onItemLayout, pillStyle };
}
