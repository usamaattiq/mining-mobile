import type { ReactNode } from 'react';
import type { ScrollViewProps, StyleProp, ViewStyle } from 'react-native';
import type { AppTopBarProps } from '@/shared/types/appTopBar.types';

export type GoldSheetScreenProps = {
  title?: string;
  left?: AppTopBarProps['left'];
  onBackPress?: () => void;
  leftSlot?: AppTopBarProps['leftSlot'];
  rightSlot?: AppTopBarProps['rightSlot'];
  titleAlign?: AppTopBarProps['titleAlign'];
  titleSize?: AppTopBarProps['titleSize'];
  headerStyle?: ViewStyle;
  /** Applied to the white curved sheet (not the gold header). */
  sheetStyle?: StyleProp<ViewStyle>;
  headerExtra?: ReactNode;
  statusBar?: boolean;
  scroll?: boolean;
  contentContainerStyle?: ScrollViewProps['contentContainerStyle'];
  style?: StyleProp<ViewStyle>;
  children: ReactNode;
} & Omit<ScrollViewProps, 'children' | 'contentContainerStyle' | 'style'>;
