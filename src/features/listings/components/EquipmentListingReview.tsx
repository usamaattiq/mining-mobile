import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { i18n as appI18n } from '@/i18n';
import { Button } from '@/shared/components/Button';
import { ToggleRow } from '@/shared/components/ToggleRow';
import { spacing } from '@/theme';
import { EquipmentListingSummaryCard } from '@/features/listings/components/EquipmentListingSummaryCard';
import type { EquipmentListingReviewProps } from '@/features/listings/types/equipmentListingReview.types';

/** Read-only summary of the details + media steps, with edit shortcuts and the final publish action. */
export function EquipmentListingReview({
  detailRows,
  media,
  deliveryAvailable,
  onChangeDetails,
  onChangeMedia,
  onPublish,
  publishing,
}: EquipmentListingReviewProps): React.ReactElement {
  const { t } = useTranslation(undefined, { i18n: appI18n });

  return (
    <View style={styles.root}>
      <EquipmentListingSummaryCard
        detailRows={detailRows}
        media={media}
        onChangeDetails={onChangeDetails}
        onChangeMedia={onChangeMedia}
      />

      <ToggleRow
        title={t('equipmentListing.deliveryAvailable')}
        subtitle={t('equipmentListing.deliveryReadOnlySubtitle')}
        enabled={deliveryAvailable}
        onToggle={() => {}}
        disabled
      />

      <Button
        label={t('equipmentListing.publish')}
        onPress={onPublish}
        loading={publishing}
        style={styles.publishButton}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    gap: spacing.lg,
  },
  publishButton: {
    marginTop: spacing.sm,
  },
});
