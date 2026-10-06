import React from 'react';
import { StyleSheet, View } from 'react-native';
import { AppText } from '@/shared/components/AppText';
import { Button } from '@/shared/components/Button';
import { palette, spacing } from '@/theme';
import type { ErrorStateProps } from '@/shared/types/errorState.types';

export function ErrorState({
  title,
  subtitle,
  retryLabel,
  onRetry,
  retryLoading = false,
}: ErrorStateProps): React.ReactElement {
  return (
    <View style={styles.root}>
      <View style={styles.textBlock}>
        <AppText weight="semibold" style={styles.title}>
          {title}
        </AppText>
        {subtitle ? <AppText style={styles.subtitle}>{subtitle}</AppText> : null}
      </View>
      <Button
        label={retryLabel}
        variant="outline"
        onPress={onRetry}
        loading={retryLoading}
        style={styles.retry}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.xl,
    gap: spacing.md,
  },
  textBlock: {
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
  },
  title: {
    fontSize: 14,
    color: palette.charcoal,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 12,
    color: palette.muted,
    textAlign: 'center',
  },
  retry: {
    minWidth: 140,
  },
});
