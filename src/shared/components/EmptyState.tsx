import React from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { AppText } from '@/shared/components/AppText';
import { FadeIn } from '@/shared/motion/FadeIn';
import { palette, spacing } from '@/theme';
import type { EmptyStateProps } from '@/shared/types/emptyState.types';

const defaultEmptyImage = require('@/assets/images/noItem.png');

export function EmptyState({
  title,
  subtitle,
  image = defaultEmptyImage,
}: EmptyStateProps): React.ReactElement {
  return (
    <FadeIn style={styles.empty}>
      {image ? <Image source={image} style={styles.image} resizeMode="contain" /> : null}
      <View style={styles.textBlock}>
        <AppText weight="semibold" style={styles.title}>
          {title}
        </AppText>
        {subtitle ? <AppText style={styles.subtitle}>{subtitle}</AppText> : null}
      </View>
    </FadeIn>
  );
}

const styles = StyleSheet.create({
  empty: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.xl,
    gap: spacing.xs,
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
  image: {
    width: 110,
    height: 110,
  },
});
