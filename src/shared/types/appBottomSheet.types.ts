import type { ReactNode } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';

export type AppBottomSheetProps = {
  visible: boolean;
  onClose: () => void;
  children: ReactNode;
  /** Sheet height as a fraction of the window (0-1). Default 0.7. */
  heightRatio?: number;
  /** Size the sheet to its children instead of a fixed window ratio. */
  fitContent?: boolean;
  sheetStyle?: StyleProp<ViewStyle>;
  /**
   * When false, the sheet ignores IME size. Use for iOS date/time wheels:
   * UIDatePicker reports as a keyboard and would otherwise shift the sheet.
   */
  avoidKeyboard?: boolean;
};
