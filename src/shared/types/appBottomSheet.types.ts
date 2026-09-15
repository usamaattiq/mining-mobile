import type { ReactNode } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';

export type AppBottomSheetProps = {
  visible: boolean;
  onClose: () => void;
  children: ReactNode;
  /** Sheet height as a fraction of the window (0-1). Default 0.7. */
  heightRatio?: number;
  sheetStyle?: StyleProp<ViewStyle>;
};
