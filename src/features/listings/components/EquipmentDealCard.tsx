import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { i18n as appI18n } from '@/i18n';
import type { EquipmentStockHold } from '@/features/listings/api/listingsApi';
import { AppText } from '@/shared/components/AppText';
import { formatMoneyAmount, parsePositiveAmount } from '@/shared/utils/formatAmount';
import { cardBackShadow, palette, radius, spacing } from '@/theme';

export function EquipmentDealCard({
  hold,
  dateLabel,
  kindLabel,
  unitsLabel,
  currencyCode,
  perUnitLabel,
  statusLabel,
  muted = false,
  action,
}: {
  hold: EquipmentStockHold;
  dateLabel: string;
  kindLabel: string;
  unitsLabel: string;
  currencyCode: string;
  perUnitLabel: string;
  statusLabel?: string;
  muted?: boolean;
  action?: React.ReactNode;
}): React.ReactElement {
  const { t } = useTranslation(undefined, { i18n: appI18n });
  const total = parsePositiveAmount(hold.price);
  const unitAmount =
    total != null && hold.units > 0 ? Math.round((total / hold.units) * 100) / 100 : null;
  const unitText = unitAmount != null ? formatMoneyAmount(currencyCode, unitAmount) : null;
  return (
    <View style={[styles.card, cardBackShadow, muted && styles.cardMuted]}>
      <View style={styles.cardRow}>
        <AppText weight="semibold" style={styles.cardTitle} numberOfLines={1}>
          {hold.buyerName}
        </AppText>
        <View style={[styles.kindBadge, muted && styles.kindBadgeMuted]}>
          <AppText weight="semibold" style={[styles.kindLabel, muted && styles.kindLabelMuted]}>
            {kindLabel}
          </AppText>
        </View>
      </View>
      <AppText style={styles.cardMeta} numberOfLines={1}>
        {statusLabel ? `${statusLabel} · ` : ''}
        {unitsLabel} · {dateLabel}
      </AppText>
      {unitText != null && total != null ? (
        <View style={styles.priceRow}>
          <AppText weight="bold" style={styles.cardPrice}>
            {unitText}
          </AppText>
          <AppText style={styles.perUnit}>{perUnitLabel}</AppText>
          <View style={styles.calculation}>
            <AppText style={styles.calculationLine} numberOfLines={1}>
              {t('rfq.offerCalculation', { price: unitText, count: hold.units })}
            </AppText>
            <AppText style={styles.calculationLine} numberOfLines={1}>
              {t('rfq.offerTotal', { amount: formatMoneyAmount(currencyCode, total) })}
            </AppText>
          </View>
        </View>
      ) : null}
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
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  cardMuted: { backgroundColor: palette.softGold },
  cardRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  cardTitle: { flex: 1, fontSize: 15, color: palette.charcoal },
  kindBadge: {
    backgroundColor: palette.softGold,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
  },
  kindBadgeMuted: { backgroundColor: palette.pureWhite },
  kindLabel: { fontSize: 11, color: palette.goldDark },
  kindLabelMuted: { color: palette.muted },
  cardMeta: { fontSize: 13, color: palette.muted },
  priceRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  cardPrice: { fontSize: 18, color: palette.charcoal },
  perUnit: { fontSize: 13, color: palette.muted },
  calculation: {
    flex: 1,
    alignItems: 'flex-end',
    gap: 2,
  },
  calculationLine: {
    fontSize: 12,
    lineHeight: 16,
    color: palette.muted,
    textAlign: 'right',
  },
});
