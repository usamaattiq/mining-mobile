import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import type { EquipmentStockHold } from '@/features/listings/api/listingsApi';
import { AppText } from '@/shared/components/AppText';
import { formatMoneyAmount, parsePositiveAmount } from '@/shared/utils/formatAmount';
import { palette, radius, spacing } from '@/theme';

export function EquipmentDealCard({
  hold,
  dateLabel,
  kindLabel,
  unitsLabel,
  currencyCode,
  statusLabel,
  muted = false,
  action,
  onPressName,
}: {
  hold: EquipmentStockHold;
  dateLabel: string;
  kindLabel: string;
  unitsLabel: string;
  currencyCode: string;
  statusLabel?: string;
  muted?: boolean;
  action?: React.ReactNode;
  onPressName?: () => void;
}): React.ReactElement {
  const total = parsePositiveAmount(hold.price);
  const meta = [statusLabel, dateLabel].filter(Boolean).join(' · ');
  return (
    <View style={[styles.card, muted && styles.cardMuted]}>
      <View style={styles.cardRow}>
        <Pressable disabled={!onPressName} onPress={onPressName} style={styles.namePress}>
          <AppText weight="semibold" style={styles.cardTitle} numberOfLines={1}>
            {hold.buyerName}
          </AppText>
        </Pressable>
        <View style={[styles.kindBadge, muted && styles.kindBadgeMuted]}>
          <AppText weight="semibold" style={[styles.kindLabel, muted && styles.kindLabelMuted]}>
            {kindLabel}
          </AppText>
        </View>
      </View>
      {meta ? (
        <AppText style={styles.cardMeta} numberOfLines={1}>
          {meta}
        </AppText>
      ) : null}
      <View style={styles.priceRow}>
        <AppText weight="bold" style={styles.cardPrice} numberOfLines={1}>
          {total != null ? formatMoneyAmount(currencyCode, total) : ''}
        </AppText>
        <AppText weight="semibold" style={styles.units} numberOfLines={1}>
          {unitsLabel}
        </AppText>
      </View>
      {action}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: palette.warmWhite,
    borderWidth: 1,
    borderColor: palette.softGold,
    borderRadius: radius.md,
    padding: spacing.md,
    gap: spacing.sm,
  },
  cardMuted: { backgroundColor: palette.softGold },
  cardRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  namePress: { flex: 1 },
  cardTitle: { fontSize: 14, color: palette.charcoal },
  kindBadge: {
    backgroundColor: palette.softGold,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
  },
  kindBadgeMuted: { backgroundColor: palette.pureWhite },
  kindLabel: { fontSize: 11, color: palette.goldDark },
  kindLabelMuted: { color: palette.muted },
  cardMeta: { fontSize: 12, color: palette.muted },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  cardPrice: { flex: 1, fontSize: 22, color: palette.charcoal },
  units: { fontSize: 16, color: palette.muted },
});
