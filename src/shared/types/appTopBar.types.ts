import type { ReactNode } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';

export type AppTopBarProps = {
  /** Left side content mode. */
  left?: 'back' | 'none';
  title?: string;
  onBackPress?: () => void;
  /** Replaces the title area — e.g. avatar + name on Home. */
  leftSlot?: ReactNode;
  /** Optional extra actions on the right. */
  rightSlot?: ReactNode;
  /** Skip top safe-area padding when the parent already applies it. */
  includeSafeArea?: boolean;
  /** 'gold' renders on a gold background with white text/icons — for use atop a CurvedSheetScrollView. */
  variant?: 'light' | 'gold';
  /** Title text alignment. Defaults to 'center'; use 'left' for main dashboard tab screens. */
  titleAlign?: 'center' | 'left';
  /** Title text size. Defaults to 'md'; use 'lg' for main dashboard tab screens. */
  titleSize?: 'md' | 'lg';
  style?: StyleProp<ViewStyle>;
};
