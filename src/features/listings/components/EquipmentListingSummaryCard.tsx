import React from 'react';
import { Image, Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { i18n as appI18n } from '@/i18n';
import { AppText } from '@/shared/components/AppText';
import { palette, radius, spacing } from '@/theme';
import { cardBackShadow } from '@/theme/cardShadow';
import { EquipmentImageViewerModal } from '@/features/listings/components/EquipmentImageViewerModal';
import { ListingVideoThumb } from '@/features/listings/components/ListingVideoThumb';
import type { EquipmentListingSummaryCardProps } from '@/features/listings/types/equipmentListingSummaryCard.types';

/** Details + media summary card, shared by the review step and the published listing detail screen. */
export function EquipmentListingSummaryCard({
  detailRows,
  media,
  onChangeDetails,
  onChangeMedia,
  hideMedia,
  description,
  plain,
}: EquipmentListingSummaryCardProps): React.ReactElement {
  const { t } = useTranslation(undefined, { i18n: appI18n });
  const [descriptionOpen, setDescriptionOpen] = React.useState(false);
  const [viewerIndex, setViewerIndex] = React.useState<number | null>(null);
  const descriptionText = description?.trim() ?? '';
  const previewMedia = media.filter((item) => item.kind === 'photo' || item.kind === 'video');

  return (
    <View style={styles.root}>
      <View style={styles.section}>
        {plain ? null : (
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
        )}
        <View style={plain ? styles.plain : [styles.card, cardBackShadow]}>
          {detailRows.map((row, index) => (
            <View
              key={row.label}
              style={[
                styles.row,
                plain && styles.rowPlain,
                index === detailRows.length - 1 && !descriptionText && styles.rowLast,
              ]}
            >
              <AppText weight="bold" style={[styles.rowLabel, plain && styles.rowLabelPlain]}>
                {row.label}
              </AppText>
              <View style={styles.rowValueWrap}>
                <AppText style={[styles.rowValue, plain && styles.rowValuePlain]} numberOfLines={1}>
                  {row.value}
                </AppText>
                {row.hint ? (
                  <AppText style={[styles.rowHint, plain && styles.rowHintPlain]} numberOfLines={1}>
                    {row.hint}
                  </AppText>
                ) : null}
                {row.onEdit ? (
                  <Pressable
                    onPress={row.onEdit}
                    hitSlop={8}
                    accessibilityRole="button"
                    accessibilityLabel={t('common.change')}
                    style={styles.editButton}
                  >
                    <Ionicons name="pencil" size={14} color={palette.gold} />
                  </Pressable>
                ) : null}
              </View>
            </View>
          ))}
          {descriptionText ? (
            <View style={styles.rowLast}>
              <Pressable
                onPress={() => setDescriptionOpen((open) => !open)}
                style={[styles.row, styles.rowLast]}
                accessibilityRole="button"
                accessibilityState={{ expanded: descriptionOpen }}
                accessibilityLabel={t('equipmentListing.description')}
              >
                <AppText weight="bold" style={[styles.rowLabel, plain && styles.rowLabelPlain]}>
                  {t('equipmentListing.description')}
                </AppText>
                <Ionicons
                  name={descriptionOpen ? 'chevron-up' : 'chevron-down'}
                  size={18}
                  color={palette.charcoal}
                />
              </Pressable>
              {descriptionOpen ? (
                <AppText style={[styles.description, plain && styles.descriptionPlain]}>
                  {descriptionText}
                </AppText>
              ) : null}
            </View>
          ) : null}
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
            {previewMedia.map((item, index) => (
              <Pressable
                key={item.id}
                style={styles.mediaSlotWrap}
                onPress={() => setViewerIndex(index)}
                accessibilityRole="imagebutton"
                accessibilityLabel={t('equipmentListing.mediaStep')}
              >
                {item.kind === 'video' ? (
                  <ListingVideoThumb uri={item.uri} style={styles.mediaSlot} iconSize={12} />
                ) : (
                  <Image source={{ uri: item.uri }} style={styles.mediaSlot} />
                )}
              </Pressable>
            ))}
          </View>
          <EquipmentImageViewerModal
            visible={viewerIndex !== null}
            media={previewMedia}
            initialIndex={viewerIndex ?? 0}
            onClose={() => setViewerIndex(null)}
          />
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
    backgroundColor: palette.pureWhite,
    borderWidth: 1,
    borderColor: palette.softGold,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  plain: {
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
  rowPlain: {
    paddingVertical: spacing.md,
  },
  rowLast: {
    borderBottomWidth: 0,
  },
  rowLabel: {
    fontSize: 13,
    color: palette.charcoal,
  },
  rowLabelPlain: {
    fontSize: 15,
  },
  rowValueWrap: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'baseline',
    gap: 4,
  },
  rowHint: {
    fontSize: 11,
    color: palette.muted,
  },
  rowHintPlain: {
    fontSize: 13,
  },
  rowValue: {
    flexShrink: 1,
    fontSize: 14,
    color: palette.muted,
    textAlign: 'right',
  },
  rowValuePlain: {
    fontSize: 16,
  },
  editButton: {
    width: 28,
    height: 28,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: palette.softGold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    color: palette.muted,
    paddingBottom: spacing.sm,
  },
  descriptionPlain: {
    fontSize: 16,
    lineHeight: 22,
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
