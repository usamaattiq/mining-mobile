import React from 'react';
import { StyleSheet, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { AppTopBar } from '@/shared/components/AppTopBar';
import {
  CURVED_SHEET_OVERLAP,
  CurvedSheetScrollView,
} from '@/features/dashboard/components/CurvedSheetScrollView';
import { palette, spacing } from '@/theme';
import type { GoldSheetScreenProps } from '@/features/dashboard/types/goldSheetScreen.types';

/** Gold header + overlapping white sheet used by dashboard and listing flows. */
export function GoldSheetScreen({
  title,
  left = 'none',
  onBackPress,
  rightSlot,
  titleAlign,
  titleSize,
  headerStyle,
  headerExtra,
  statusBar = true,
  scroll = true,
  contentContainerStyle,
  style,
  children,
  ...scrollProps
}: GoldSheetScreenProps): React.ReactElement {
  return (
    <View style={[styles.root, style]}>
      {statusBar ? <StatusBar style="light" /> : null}
      <AppTopBar
        variant="gold"
        left={left}
        title={title}
        onBackPress={onBackPress}
        rightSlot={rightSlot}
        titleAlign={titleAlign}
        titleSize={titleSize}
        style={[styles.header, headerStyle]}
      />
      {headerExtra}
      {scroll ? (
        <CurvedSheetScrollView contentContainerStyle={contentContainerStyle} {...scrollProps}>
          {children}
        </CurvedSheetScrollView>
      ) : (
        <View style={styles.sheet}>{children}</View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: palette.gold,
  },
  header: {
    paddingBottom: spacing.xl,
  },
  sheet: {
    flex: 1,
    backgroundColor: palette.pureWhite,
    borderTopLeftRadius: CURVED_SHEET_OVERLAP,
    borderTopRightRadius: CURVED_SHEET_OVERLAP,
    marginTop: -CURVED_SHEET_OVERLAP,
    overflow: 'hidden',
  },
});
