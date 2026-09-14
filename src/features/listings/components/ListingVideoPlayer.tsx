import React from 'react';
import { StyleSheet } from 'react-native';
import { useVideoPlayer, VideoView } from 'expo-video';
import type { ListingVideoPlayerProps } from '@/features/listings/types/listingVideoPlayer.types';

/** Full-screen listing video with native playback controls. */
export function ListingVideoPlayer({
  uri,
  style,
  active = false,
}: ListingVideoPlayerProps): React.ReactElement {
  const player = useVideoPlayer(uri, (instance) => {
    instance.loop = false;
    instance.pause();
  });

  React.useEffect(() => {
    if (active) {
      player.play();
      return;
    }
    player.pause();
    player.currentTime = 0;
  }, [active, player]);

  return (
    <VideoView
      player={player}
      style={[styles.video, style]}
      nativeControls
      contentFit="contain"
      fullscreenOptions={{ enable: true }}
    />
  );
}

const styles = StyleSheet.create({
  video: {
    width: '100%',
    height: '100%',
    backgroundColor: '#000000',
  },
});
