import type { ReactNode } from 'react';
import type { ViewStyle } from 'react-native';

export type AppTopBarProps = {
  /** Left side content mode. */
  left?: 'back' | 'none';
  title?: string;
  onBackPress?: () => void;
  /** Optional extra actions on the right. */
  rightSlot?: ReactNode;
  /** Skip top safe-area padding when the parent already applies it. */
  includeSafeArea?: boolean;
  /** 'gold' renders on a gold background with white text/icons — for use atop a CurvedSheetScrollView. */
  variant?: 'light' | 'gold';
  style?: ViewStyle;
};
