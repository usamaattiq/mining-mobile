import React from 'react';
import { ScrollView, StyleSheet, type ScrollViewProps } from 'react-native';
import { palette, radius, spacing } from '@/theme';

const OVERLAP = radius.lg + 4;

/** Rounded white sheet that curves up and overlaps a colored header above it. */
export function CurvedSheetScrollView({
  contentContainerStyle,
  children,
  ...rest
}: ScrollViewProps): React.ReactElement {
  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={[styles.content, contentContainerStyle]}
      showsVerticalScrollIndicator={false}
      bounces={false}
      {...rest}
    >
      {children}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: palette.warmWhite,
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
