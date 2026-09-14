import React from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  type LayoutChangeEvent,
  type NativeSyntheticEvent,
  type NativeScrollEvent,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { palette, radius, spacing } from '@/theme';
import { ListingVideoThumb } from '@/features/listings/components/ListingVideoThumb';
import type { EquipmentImageCarouselProps } from '@/features/listings/types/equipmentImageCarousel.types';

const CAROUSEL_HEIGHT = 280;

/** Swipeable photo carousel sized to its container (not the full screen width) — tap a slide to open it full screen. */
export function EquipmentImageCarousel({
  media,
  onPressImage,
  style,
}: EquipmentImageCarouselProps): React.ReactElement {
  const [containerWidth, setContainerWidth] = React.useState(0);
  const [activeIndex, setActiveIndex] = React.useState(0);
  const hasMedia = media.length > 0;

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
                  source={{ uri: item.uri }}
                  style={{ width: containerWidth, height: CAROUSEL_HEIGHT }}
                  resizeMode="cover"
                />
              )}
            </Pressable>
          ))}
        </ScrollView>
      ) : (
        <View style={styles.placeholder}>
          <Ionicons name="image-outline" size={36} color={palette.muted} />
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
