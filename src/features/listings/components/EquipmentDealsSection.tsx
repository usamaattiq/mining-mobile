import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { i18n as appI18n } from '@/i18n';
import { EquipmentDealCard } from '@/features/listings/components/EquipmentDealCard';
import { listingsApi, type EquipmentStockHold } from '@/features/listings/api/listingsApi';
import { AppText } from '@/shared/components/AppText';
import { useCurrency } from '@/shared/hooks/useCurrency';
import { palette, spacing } from '@/theme';

export function EquipmentDealsSection({ listingId }: { listingId: string }): React.ReactElement | null {
  const { t } = useTranslation(undefined, { i18n: appI18n });
  const currency = useCurrency();
  const [holds, setHolds] = React.useState<EquipmentStockHold[] | null>(null);

  React.useEffect(() => {
    let cancelled = false;
    void listingsApi.equipmentStock(listingId).then((stock) => {
      if (!cancelled) setHolds(stock.holds);
    });
    return () => {
      cancelled = true;
    };
  }, [listingId]);

  if (!holds || holds.length === 0) return null;

  const active = holds.filter((hold) => hold.status === 'active');
  const returned = holds.filter((hold) => hold.status === 'returned');

  return (
    <View style={styles.section}>
      <AppText weight="bold" style={styles.title}>
        {t('equipmentListing.stockRecords')}
      </AppText>
      {active.map((hold) => (
        <EquipmentDealCard
          key={hold.id}
          hold={hold}
          dateLabel={formatDealDate(appI18n.language, hold.createdAt)}
          kindLabel={hold.kind === 'rent' ? t('equipmentListing.rent') : t('equipmentListing.sell')}
          unitsLabel={t('equipmentListing.unitsCount', { count: hold.units })}
          currencyCode={currency.code}
          perUnitLabel={t('rfq.pricePerUnit')}
        />
      ))}
      {returned.map((hold) => (
        <EquipmentDealCard
          key={hold.id}
          hold={hold}
          muted
          dateLabel={formatDealDate(appI18n.language, hold.createdAt)}
          kindLabel={t('equipmentListing.rent')}
          unitsLabel={t('equipmentListing.unitsCount', { count: hold.units })}
          currencyCode={currency.code}
          perUnitLabel={t('rfq.pricePerUnit')}
          statusLabel={t('equipmentListing.stockReturned')}
        />
      ))}
    </View>
  );
}

function formatDealDate(locale: string, epoch: number): string {
  return new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }).format(new Date(epoch));
}

const styles = StyleSheet.create({
  section: { gap: spacing.md },
  title: { fontSize: 16, color: palette.charcoal },
});
