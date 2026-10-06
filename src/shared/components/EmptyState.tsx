import React from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { AppText } from '@/shared/components/AppText';
import { palette, spacing } from '@/theme';
import type { EmptyStateProps } from '@/shared/types/emptyState.types';

export function EmptyState({ title, subtitle, image }: EmptyStateProps): React.ReactElement {
  return (
    <View style={styles.empty}>
      {image ? <Image source={image} style={styles.image} resizeMode="contain" /> : null}
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
  image: {
    width: 160,
    height: 160,
    marginBottom: spacing.sm,
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
