import React from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { AppText } from '@/shared/components/AppText';
import { palette, spacing } from '@/theme';
import type { EmptyStateProps } from '@/shared/types/emptyState.types';

const defaultEmptyImage = require('@/assets/images/noItem.png');

export function EmptyState({
  title,
  subtitle,
  image = defaultEmptyImage,
}: EmptyStateProps): React.ReactElement {
  return (
    <View style={styles.empty}>
      <Image source={image} style={styles.image} resizeMode="contain" />
      <View style={styles.textBlock}>
        <AppText weight="semibold" style={styles.title}>
          {title}
        </AppText>
        {subtitle ? <AppText style={styles.subtitle}>{subtitle}</AppText> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  empty: {
    paddingVertical: spacing.xxl,
    alignItems: 'center',
    gap: spacing.md,
  },
  textBlock: {
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
  },
  title: {
    fontSize: 12,
    color: palette.charcoal,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 11,
    color: palette.muted,
    textAlign: 'center',
  },
  image: {
    width: 120,
    height: 120,
  },
});
