import React, { useEffect, useState } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { Image, type ImageContentFit, type ImageSource } from 'expo-image';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { palette } from '@/theme';

type RemoteImageProps = {
  source: ImageSource | string | number;
  style?: StyleProp<ViewStyle>;
  contentFit?: ImageContentFit;
  recyclingKey?: string;
};

/** Photo with a shimmer skeleton on top until the file is ready. */
export function RemoteImage({
  source,
  style,
  contentFit = 'cover',
  recyclingKey,
}: RemoteImageProps): React.ReactElement {
  const [loaded, setLoaded] = useState(false);
  const shimmer = useSharedValue(-1);
  const sourceKey = typeof source === 'string' ? source : recyclingKey ?? '';

  useEffect(() => {
    setLoaded(false);
  }, [sourceKey]);

  useEffect(() => {
    shimmer.value = withRepeat(
      withTiming(1, { duration: 1100, easing: Easing.inOut(Easing.ease) }),
      -1,
      false,
    );
  }, [shimmer]);

  const shimmerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: -90 + shimmer.value * 480 }],
  }));

  return (
    <View style={[styles.frame, style]}>
      <Image
        source={source}
        style={StyleSheet.absoluteFill}
        contentFit={contentFit}
        cachePolicy="memory-disk"
        recyclingKey={recyclingKey}
        onLoad={() => setLoaded(true)}
        onError={() => setLoaded(true)}
      />
      {loaded ? null : (
        <View style={styles.skeleton} pointerEvents="none">
          <Animated.View style={[styles.shimmer, shimmerStyle]} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    overflow: 'hidden',
    backgroundColor: palette.softGold,
  },
  skeleton: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#E7D7B0',
    overflow: 'hidden',
  },
  shimmer: {
    width: 80,
    height: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.55)',
  },
});
