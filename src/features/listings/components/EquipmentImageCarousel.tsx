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
import { RemoteImage } from '@/shared/components/RemoteImage';
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
  statusBadge,
  style,
}: EquipmentImageCarouselProps): React.ReactElement {
  const windowWidth = useWindowDimensions().width;
  const [containerWidth, setContainerWidth] = React.useState(windowWidth);
  const [activeIndex, setActiveIndex] = React.useState(0);
  const scrollRef = React.useRef<ScrollView>(null);
  const ignoreScrollEnd = React.useRef(false);
  const [thumbRowWidth, setThumbRowWidth] = React.useState(0);
  const hasMedia = media.length > 0;
  const thumbWidth =
    thumbRowWidth > 0
      ? ((thumbRowWidth - spacing.md * 2 - spacing.xs * 3 - spacing.xl) / 4) * 0.9
      : undefined;

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

  const handleScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (ignoreScrollEnd.current) {
      ignoreScrollEnd.current = false;
      return;
    }
    if (containerWidth <= 0) return;
    const index = Math.round(event.nativeEvent.contentOffset.x / containerWidth);
    setActiveIndex(Math.min(Math.max(index, 0), Math.max(media.length - 1, 0)));
  };

  const showSlide = (index: number) => {
    ignoreScrollEnd.current = true;
    setActiveIndex(index);
    scrollRef.current?.scrollTo({ x: index * containerWidth, animated: false });
  };

  return (
    <View style={[styles.root, style]}>
      <View style={[styles.stage, { height: CAROUSEL_HEIGHT }]} onLayout={handleLayout}>
        {hasMedia && containerWidth > 0 ? (
          <ScrollView
            ref={scrollRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={handleScrollEnd}
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
                  <RemoteImage
                    source={item.uri}
                    style={{ width: containerWidth, height: CAROUSEL_HEIGHT }}
                    contentFit="cover"
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
        {statusBadge ? (
          <View style={styles.statusBadge} pointerEvents="none">
            {statusBadge}
          </View>
        ) : null}
      </View>

      {media.length > 1 ? (
        <View
          style={styles.thumbs}
          onLayout={(event) => setThumbRowWidth(event.nativeEvent.layout.width)}
        >
          {media.map((item, index) => {
            const selected = index === activeIndex;
            return (
              <Pressable
                key={item.id}
                onPress={() => showSlide(index)}
                style={[
                  styles.thumb,
                  thumbWidth != null && { width: thumbWidth, height: thumbWidth },
                  selected && styles.thumbSelected,
                ]}
              >
                {item.kind === 'video' ? (
                  <ListingVideoThumb uri={item.uri} style={styles.thumbMedia} iconSize={14} />
                ) : (
                  <RemoteImage
                    source={item.uri}
                    style={styles.thumbMedia}
                    contentFit="cover"
                    recyclingKey={`${item.id}-thumb`}
                  />
                )}
              </Pressable>
            );
          })}
        </View>
      ) : null}
    </View>
  );
}

const THUMB_SIZE = 64;

const styles = StyleSheet.create({
  root: {
    alignSelf: 'stretch',
    backgroundColor: palette.pureWhite,
  },
  stage: {
    alignSelf: 'stretch',
    overflow: 'hidden',
    backgroundColor: palette.softGold,
  },
  placeholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusBadge: {
    position: 'absolute',
    right: spacing.md,
    bottom: spacing.md,
  },
  thumbs: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.xs,
  },
  thumb: {
    height: THUMB_SIZE,
    borderRadius: radius.md,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  thumbSelected: {
    borderColor: palette.gold,
  },
  thumbMedia: {
    width: '100%',
    height: '100%',
  },
});
