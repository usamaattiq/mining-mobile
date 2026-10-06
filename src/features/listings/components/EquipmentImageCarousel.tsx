import React from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  View,
  type LayoutChangeEvent,
  type NativeSyntheticEvent,
  type NativeScrollEvent,
} from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { palette, radius, spacing } from '@/theme';
import { ListingVideoThumb } from '@/features/listings/components/ListingVideoThumb';
import type { EquipmentImageCarouselProps } from '@/features/listings/types/equipmentImageCarousel.types';

const CAROUSEL_HEIGHT = 280;

/** Swipeable photo carousel sized to its container (not the full screen width) — tap a slide to open it full screen. */
export function EquipmentImageCarousel({
  media,
  onPressImage,
  placeholderIcon = 'image-outline',
  style,
}: EquipmentImageCarouselProps): React.ReactElement {
  const windowWidth = useWindowDimensions().width;
  const [containerWidth, setContainerWidth] = React.useState(windowWidth);
  const [activeIndex, setActiveIndex] = React.useState(0);
  const hasMedia = media.length > 0;

  const photoUrls = media
    .filter((item) => item.kind !== 'video')
    .map((item) => item.uri)
    .join('\n');

  React.useEffect(() => {
    const urls = photoUrls.split('\n').filter(Boolean);
    if (urls.length > 0) void Image.prefetch(urls);
  }, [photoUrls]);

  const handleLayout = (event: LayoutChangeEvent) => {
    setContainerWidth(event.nativeEvent.layout.width);
  };

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (containerWidth <= 0) return;
    const index = Math.round(event.nativeEvent.contentOffset.x / containerWidth);
    setActiveIndex(index);
  };

  return (
    <View style={[styles.root, { height: CAROUSEL_HEIGHT }, style]} onLayout={handleLayout}>
      {hasMedia && containerWidth > 0 ? (
        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
        >
          {media.map((item, index) => (
            <Pressable key={item.id} onPress={() => onPressImage(index)}>
              {item.kind === 'video' ? (
                <ListingVideoThumb
                  uri={item.uri}
                  style={{ width: containerWidth, height: CAROUSEL_HEIGHT }}
                  iconSize={22}
                />
              ) : (
                <Image
                  source={item.uri}
                  style={{ width: containerWidth, height: CAROUSEL_HEIGHT }}
                  contentFit="cover"
                  cachePolicy="memory-disk"
                  recyclingKey={item.id}
                />
              )}
            </Pressable>
          ))}
        </ScrollView>
      ) : (
        <View style={styles.placeholder}>
          <Ionicons name={placeholderIcon} size={72} color={palette.goldDark} />
        </View>
      )}

      {media.length > 1 ? (
        <View style={styles.dots}>
          {media.map((item, index) => (
            <View key={item.id} style={[styles.dot, index === activeIndex && styles.dotActive]} />
          ))}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    alignSelf: 'stretch',
    borderRadius: radius.lg,
    overflow: 'hidden',
    backgroundColor: palette.softGold,
  },
  placeholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dots: {
    position: 'absolute',
    bottom: spacing.sm,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.6)',
  },
  dotActive: {
    backgroundColor: palette.pureWhite,
    width: 16,
  },
});
