import React from 'react';
import { StyleSheet, View } from 'react-native';
import { AppText } from '@/shared/components/AppText';
import { palette, spacing } from '@/theme';
import type { EmptyStateProps } from '@/shared/types/emptyState.types';

export function EmptyState({ title, subtitle }: EmptyStateProps): React.ReactElement {
  return (
    <View style={styles.empty}>
      <AppText weight="semibold" style={styles.title}>
        {title}
      </AppText>
      {subtitle ? <AppText style={styles.subtitle}>{subtitle}</AppText> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  empty: {
    paddingVertical: spacing.xxl,
    alignItems: 'center',
    gap: spacing.xs,
  },
  title: {
    fontSize: 15,
    color: palette.charcoal,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 13,
    color: palette.muted,
    textAlign: 'center',
  },
});
