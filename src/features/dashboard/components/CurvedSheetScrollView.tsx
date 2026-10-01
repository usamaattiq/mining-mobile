import React from 'react';
import { StyleSheet, type ScrollViewProps } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { useFloatingTabBarContentPadding } from '@/features/dashboard/components/FloatingTabBar';
import { palette, radius, spacing } from '@/theme';

export const CURVED_SHEET_OVERLAP = radius.lg + 4;

/**
 * Rounded white sheet that curves up and overlaps a colored header above it.
 * Keyboard-aware so any input inside stays scrolled above the keyboard when focused.
 */
export function CurvedSheetScrollView({
  contentContainerStyle,
  children,
  refreshControl,
  style,
  ...rest
}: ScrollViewProps): React.ReactElement {
  const tabBarPadding = useFloatingTabBarContentPadding();

  return (
    <KeyboardAwareScrollView
      style={[styles.scroll, style]}
      contentContainerStyle={[
        styles.content,
        tabBarPadding > 0 && { paddingBottom: spacing.md + tabBarPadding },
        contentContainerStyle,
      ]}
      showsVerticalScrollIndicator={false}
      bounces={Boolean(refreshControl) || rest.bounces}
      alwaysBounceVertical={Boolean(refreshControl)}
      keyboardShouldPersistTaps="handled"
      bottomOffset={72}
      extraKeyboardSpace={0}
      refreshControl={refreshControl}
      {...rest}
    >
      {children}
    </KeyboardAwareScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: palette.pureWhite,
    borderTopLeftRadius: CURVED_SHEET_OVERLAP,
    borderTopRightRadius: CURVED_SHEET_OVERLAP,
    marginTop: -CURVED_SHEET_OVERLAP,
    overflow: 'hidden',
  },
  content: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
    gap: spacing.md,
  },
});
