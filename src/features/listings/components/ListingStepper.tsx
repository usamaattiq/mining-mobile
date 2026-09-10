import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { i18n as appI18n } from '@/i18n';
import { AppText } from '@/shared/components/AppText';
import { palette, radius, spacing } from '@/theme';
import type { ListingStepperProps } from '@/features/listings/types/listingStepper.types';

/** Gold-header loading-bar step progress for the equipment listing wizard. */
export function ListingStepper({ steps, currentStep }: ListingStepperProps): React.ReactElement {
  const { t } = useTranslation(undefined, { i18n: appI18n });
  const total = steps.length;
  const current = Math.min(currentStep, total - 1);
  const fillPercent = ((current + 1) / total) * 100;

  return (
    <View style={styles.root}>
      <AppText weight="bold" style={styles.stepLabel}>
        {t('equipmentListing.stepLabel', { current: current + 1, total })}
      </AppText>
      <View style={styles.track}>
        <View style={[styles.trackFill, { width: `${fillPercent}%` }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    width: '100%',
    gap: spacing.xs,
    paddingBottom: spacing.md,
  },
  stepLabel: {
    fontSize: 14,
    color: palette.pureWhite,
  },
  track: {
    height: 6,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(255,255,255,0.3)',
    overflow: 'hidden',
  },
  trackFill: {
    height: '100%',
    borderRadius: radius.pill,
    backgroundColor: palette.pureWhite,
  },
});
