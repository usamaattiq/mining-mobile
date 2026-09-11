import React from 'react';
import { StyleSheet, type ScrollViewProps } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { palette, radius, spacing } from '@/theme';

const OVERLAP = radius.lg + 4;

/**
 * Rounded white sheet that curves up and overlaps a colored header above it.
 * Keyboard-aware so any input inside stays scrolled above the keyboard when focused.
 */
export function CurvedSheetScrollView({
  contentContainerStyle,
  children,
  ...rest
}: ScrollViewProps): React.ReactElement {
  return (
    <KeyboardAwareScrollView
      style={styles.scroll}
      contentContainerStyle={[styles.content, contentContainerStyle]}
      showsVerticalScrollIndicator={false}
      bounces={false}
      keyboardShouldPersistTaps="handled"
      bottomOffset={100}
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
    borderTopLeftRadius: OVERLAP,
    borderTopRightRadius: OVERLAP,
    marginTop: -OVERLAP,
    overflow: 'hidden',
  },
  content: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.lg,
    paddingBottom: spacing.lg,
    gap: spacing.md,
  },
});
