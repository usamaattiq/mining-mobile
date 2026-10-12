import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { i18n as appI18n } from '@/i18n';
import { AppText } from '@/shared/components/AppText';
import { formatMoneyAmount } from '@/shared/utils/formatAmount';
import { palette, radius, spacing } from '@/theme';

export type PriceTimesUnitsSummaryProps = {
  currencyCode: string;
  unitAmount: number;
  units: number;
  compact?: boolean;
};

export function PriceTimesUnitsSummary({
  currencyCode,
  unitAmount,
  units,
  compact = false,
}: PriceTimesUnitsSummaryProps): React.ReactElement {
  const { t } = useTranslation(undefined, { i18n: appI18n });
  const total = Math.round(unitAmount * units * 100) / 100;
  const unitText = formatMoneyAmount(currencyCode, unitAmount);
  const totalText = formatMoneyAmount(currencyCode, total);

  if (compact) {
    return (
      <View style={styles.compactWrap}>
        <View style={styles.compactPriceRow}>
          <AppText weight="bold" style={styles.compactPrice} numberOfLines={1}>
            {totalText}
          </AppText>
          <AppText weight="semibold" style={styles.compactUnits} numberOfLines={1}>
            {t('equipmentListing.unitsCount', { count: units })}
          </AppText>
        </View>
        <AppText style={styles.compact} numberOfLines={2}>
          {t('rfq.offerCalculation', { price: unitText, count: units })}
        </AppText>
      </View>
    );
  }

  return (
    <View style={styles.card}>
      <View style={styles.line}>
        <View style={styles.part}>
          <AppText weight="bold" style={styles.unitAmount} numberOfLines={1}>
            {unitText}
          </AppText>
          <AppText style={styles.hint} numberOfLines={1}>
            {t('rfq.pricePerUnit')}
          </AppText>
        </View>
        <AppText style={styles.op}>×</AppText>
        <View style={styles.part}>
          <AppText weight="bold" style={styles.unitAmount} numberOfLines={1}>
            {units}
          </AppText>
          <AppText style={styles.hint} numberOfLines={1}>
            {t('rfq.unitsLabel')}
          </AppText>
        </View>
        <AppText style={styles.op}>=</AppText>
        <View style={[styles.part, styles.totalPart]}>
          <AppText weight="bold" style={styles.totalAmount} numberOfLines={1}>
            {totalText}
          </AppText>
          <AppText style={styles.hint} numberOfLines={1}>
            {t('rfq.totalLabel')}
          </AppText>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderColor: palette.softGold,
    backgroundColor: palette.warmWhite,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
  },
  line: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  part: {
    flex: 1,
    minWidth: 0,
  },
  totalPart: {
    alignItems: 'flex-end',
  },
  unitAmount: {
    fontSize: 15,
    color: palette.charcoal,
  },
  totalAmount: {
    fontSize: 15,
    color: palette.gold,
  },
  hint: {
    fontSize: 11,
    color: palette.muted,
    marginTop: 1,
  },
  op: {
    fontSize: 16,
    color: palette.muted,
    paddingBottom: 12,
  },
  compactWrap: {
    gap: 2,
  },
  compactPriceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  compactPrice: {
    flex: 1,
    fontSize: 22,
    color: palette.charcoal,
  },
  compactUnits: {
    fontSize: 16,
    color: palette.muted,
  },
  compact: {
    fontSize: 12,
    lineHeight: 16,
    color: palette.muted,
  },
});
