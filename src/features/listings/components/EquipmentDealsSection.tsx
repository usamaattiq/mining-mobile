import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { i18n as appI18n } from '@/i18n';
import { EquipmentDealCard } from '@/features/listings/components/EquipmentDealCard';
import { listingsApi, type EquipmentStockHold } from '@/features/listings/api/listingsApi';
import { AppText } from '@/shared/components/AppText';
import { Button } from '@/shared/components/Button';
import { useCurrency } from '@/shared/hooks/useCurrency';
import { openWhatsApp } from '@/shared/utils/openWhatsApp';
import { palette, radius, spacing } from '@/theme';

export function EquipmentDealsSection({
  listingId,
  revision,
  buyerPhones,
  onMessageBuyer,
  onPressBuyer,
}: {
  listingId: string;
  revision?: string;
  buyerPhones?: Record<string, string>;
  onMessageBuyer?: (buyer: { id: string; fullName: string }) => void;
  onPressBuyer?: (buyerId: string) => void;
}): React.ReactElement | null {
  const { t } = useTranslation(undefined, { i18n: appI18n });
  const currency = useCurrency();
  const [holds, setHolds] = React.useState<EquipmentStockHold[] | null>(null);

  React.useEffect(() => {
    let cancelled = false;
    void listingsApi
      .equipmentStock(listingId)
      .then((stock) => {
        if (!cancelled) setHolds(stock.holds);
      })
      .catch(() => {
        if (!cancelled) setHolds([]);
      });
    return () => {
      cancelled = true;
    };
  }, [listingId, revision]);

  const contactAction = (hold: EquipmentStockHold) => {
    if (!hold.buyerId) return null;
    const phone = buyerPhones?.[hold.buyerId] ?? hold.buyerPhone;
    if (!onMessageBuyer && !phone) return null;
    return (
      <View style={styles.contactRow}>
        {onMessageBuyer ? (
          <Button
            label={t('messages.message')}
            icon="chatbubble-ellipses-outline"
            onPress={() => onMessageBuyer({ id: hold.buyerId!, fullName: hold.buyerName })}
            style={styles.contactButton}
          />
        ) : null}
        {phone ? (
          <Button
            label={t('common.whatsapp')}
            icon="logo-whatsapp"
            variant="whatsapp"
            onPress={() => openWhatsApp(phone)}
            style={styles.contactButton}
          />
        ) : null}
      </View>
    );
  };

  if (!holds || holds.length === 0) return null;

  const active = holds.filter((hold) => hold.status === 'active');
  const returned = holds.filter((hold) => hold.status === 'returned');

  if (active.length === 0 && returned.length === 0) return null;

  return (
    <View style={styles.section}>
      <AppText weight="bold" style={styles.title}>
        {t('equipmentListing.stockRecords')}
      </AppText>
      {active.map((hold) => (
        <EquipmentDealCard
          key={hold.id}
          hold={hold}
          dateLabel={formatDealDate(appI18n.language, hold.acceptedAt ?? hold.createdAt)}
          kindLabel={hold.kind === 'rent' ? t('equipmentListing.rent') : t('equipmentListing.sell')}
          unitsLabel={t('equipmentListing.unitsCount', { count: hold.units })}
          currencyCode={currency.code}
          action={contactAction(hold)}
          onPressName={hold.buyerId && onPressBuyer ? () => onPressBuyer(hold.buyerId!) : undefined}
        />
      ))}
      {returned.map((hold) => (
        <EquipmentDealCard
          key={hold.id}
          hold={hold}
          muted
          dateLabel={formatDealDate(appI18n.language, hold.acceptedAt ?? hold.createdAt)}
          kindLabel={t('equipmentListing.rent')}
          unitsLabel={t('equipmentListing.unitsCount', { count: hold.units })}
          currencyCode={currency.code}
          statusLabel={t('equipmentListing.stockReturned')}
          action={contactAction(hold)}
          onPressName={hold.buyerId && onPressBuyer ? () => onPressBuyer(hold.buyerId!) : undefined}
        />
      ))}
    </View>
  );
}

function formatDealDate(locale: string, epoch: number): string {
  return new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(epoch));
}

const styles = StyleSheet.create({
  section: { gap: spacing.md },
  title: { fontSize: 16, color: palette.charcoal },
  contactRow: { flexDirection: 'row', gap: spacing.sm },
  contactButton: {
    flex: 1,
    minHeight: 36,
    borderRadius: radius.md,
    paddingVertical: 6,
    paddingHorizontal: spacing.md,
  },
});
