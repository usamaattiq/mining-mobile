import type { StyleProp, ViewStyle } from 'react-native';

export type ListingVideoPlayerProps = {
  uri: string;
  style?: StyleProp<ViewStyle>;
  /** Plays only while this slide is the visible one. */
  active?: boolean;
};
