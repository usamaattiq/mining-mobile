import React from 'react';
import { Image, StyleSheet, View } from 'react-native';
import * as VideoThumbnails from 'expo-video-thumbnails';
import { Ionicons } from '@expo/vector-icons';
import { palette } from '@/theme';
import type { ListingVideoThumbProps } from '@/features/listings/types/listingVideoThumb.types';

/** Still frame plus a play badge — used wherever a video URI cannot be shown as an Image. */
export function ListingVideoThumb({
  uri,
  style,
  iconSize = 14,
}: ListingVideoThumbProps): React.ReactElement {
  const [thumb, setThumb] = React.useState<string | null>(null);

  React.useEffect(() => {
    let cancelled = false;
    void VideoThumbnails.getThumbnailAsync(uri, { time: 500 })
      .then((result) => {
        if (!cancelled) setThumb(result.uri);
      })
      .catch(() => {
        if (!cancelled) setThumb(null);
      });
    return () => {
      cancelled = true;
    };
  }, [uri]);

  return (
    <View style={[styles.root, style]}>
      {thumb ? (
        <Image source={{ uri: thumb }} style={styles.fill} />
      ) : (
        <View style={[styles.fill, styles.fallback]} />
      )}
      <View style={styles.badgeWrap} pointerEvents="none">
        <View style={styles.badge}>
          <Ionicons name="play" size={iconSize} color={palette.pureWhite} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    overflow: 'hidden',
    backgroundColor: palette.softGold,
  },
  fill: {
    ...StyleSheet.absoluteFill,
  },
  fallback: {
    backgroundColor: palette.charcoal,
  },
  badgeWrap: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.65)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
