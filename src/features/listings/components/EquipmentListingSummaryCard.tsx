import React from 'react';
import { Image, Pressable, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { i18n as appI18n } from '@/i18n';
import { AppText } from '@/shared/components/AppText';
import { palette, radius, spacing } from '@/theme';
import { cardBackShadow } from '@/theme/cardShadow';
import { ListingVideoThumb } from '@/features/listings/components/ListingVideoThumb';
import type { EquipmentListingSummaryCardProps } from '@/features/listings/types/equipmentListingSummaryCard.types';

/** Details + media summary card, shared by the review step and the published listing detail screen. */
export function EquipmentListingSummaryCard({
  detailRows,
  media,
  onChangeDetails,
  onChangeMedia,
  hideMedia,
}: EquipmentListingSummaryCardProps): React.ReactElement {
  const { t } = useTranslation(undefined, { i18n: appI18n });

  return (
    <View style={styles.root}>
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <AppText weight="bold" style={styles.sectionTitle}>
            {t('equipmentListing.detailsStep')}
          </AppText>
          {onChangeDetails ? (
            <Pressable onPress={onChangeDetails} hitSlop={8}>
              <AppText weight="semibold" style={styles.changeLink}>
                {t('common.change')}
              </AppText>
            </Pressable>
          ) : null}
        </View>
        <View style={[styles.card, cardBackShadow]}>
          {detailRows.map((row, index) => (
            <View
              key={row.label}
              style={[styles.row, index === detailRows.length - 1 && styles.rowLast]}
            >
              <AppText style={styles.rowLabel}>{row.label}</AppText>
              <AppText weight="semibold" style={styles.rowValue} numberOfLines={1}>
                {row.value}
              </AppText>
            </View>
          ))}
        </View>
      </View>

      {!hideMedia && media.length > 0 ? (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <AppText weight="bold" style={styles.sectionTitle}>
              {t('equipmentListing.mediaStep')}
            </AppText>
            {onChangeMedia ? (
              <Pressable onPress={onChangeMedia} hitSlop={8}>
                <AppText weight="semibold" style={styles.changeLink}>
                  {t('common.change')}
                </AppText>
              </Pressable>
            ) : null}
          </View>
          <View style={styles.mediaGrid}>
            {media.map((item) => (
              <View key={item.id} style={styles.mediaSlotWrap}>
                {item.kind === 'video' ? (
                  <ListingVideoThumb uri={item.uri} style={styles.mediaSlot} iconSize={12} />
                ) : (
                  <Image source={{ uri: item.uri }} style={styles.mediaSlot} />
                )}
              </View>
            ))}
          </View>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    gap: spacing.lg,
  },
  section: {
    gap: spacing.xs,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    fontSize: 15,
    color: palette.charcoal,
  },
  changeLink: {
    fontSize: 13,
    color: palette.gold,
  },
  card: {
    backgroundColor: palette.warmWhite,
    borderWidth: 1,
    borderColor: palette.softGold,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: palette.softGold,
  },
  rowLast: {
    borderBottomWidth: 0,
  },
  rowLabel: {
    fontSize: 13,
    color: palette.muted,
  },
  rowValue: {
    flex: 1,
    fontSize: 14,
    color: palette.charcoal,
    textAlign: 'right',
  },
  mediaGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  mediaSlotWrap: {
    width: 84,
    height: 84,
    borderRadius: radius.md,
    overflow: 'hidden',
  },
  mediaSlot: {
    width: 84,
    height: 84,
    backgroundColor: palette.softGold,
  },
});
