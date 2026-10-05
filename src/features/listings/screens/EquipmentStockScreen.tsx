import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { i18n as appI18n } from '@/i18n';
import type { RootStackParamList } from '@/navigation/types';
import { GoldSheetScreen } from '@/features/dashboard/components/GoldSheetScreen';
import { EquipmentDealCard } from '@/features/listings/components/EquipmentDealCard';
import { AppText } from '@/shared/components/AppText';
import { Button } from '@/shared/components/Button';
import { showAppAlert } from '@/shared/services/appAlert';
import { ApiError } from '@/shared/services/api';
import {
  listingsApi,
  type EquipmentStock,
  type EquipmentStockHold,
} from '@/features/listings/api/listingsApi';
import { useCurrency } from '@/shared/hooks/useCurrency';
import { cardBackShadow, palette, radius, spacing } from '@/theme';

type Props = NativeStackScreenProps<RootStackParamList, 'EquipmentStock'>;

export function EquipmentStockScreen({ navigation, route }: Props): React.ReactElement {
  const { id } = route.params;
  const { t } = useTranslation(undefined, { i18n: appI18n });
  const currency = useCurrency();
  const [stock, setStock] = React.useState<EquipmentStock | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [returningId, setReturningId] = React.useState<string | null>(null);

  const load = React.useCallback(() => {
    setLoading(true);
    void listingsApi
      .equipmentStock(id)
      .then(setStock)
      .catch((error: unknown) => {
        const message = error instanceof ApiError ? error.message : t('common.error');
        showAppAlert(t('common.error'), message);
      })
      .finally(() => setLoading(false));
  }, [id, t]);

  React.useEffect(() => {
    load();
  }, [load]);

  const returnHold = (hold: EquipmentStockHold) => {
    showAppAlert(
      t('equipmentListing.returnToCatalogTitle'),
      t('equipmentListing.returnToCatalogMessage'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.confirm'),
          onPress: () => {
            setReturningId(hold.id);
            void listingsApi
              .returnRentedUnits(id, hold.id)
              .then(setStock)
              .catch((error: unknown) => {
                const message = error instanceof ApiError ? error.message : t('common.error');
                showAppAlert(t('common.error'), message);
              })
              .finally(() => setReturningId(null));
          },
        },
      ],
    );
  };

  const active = stock?.holds.filter((hold) => hold.status === 'active') ?? [];
  const returned = stock?.holds.filter((hold) => hold.status === 'returned') ?? [];

  return (
    <GoldSheetScreen
      title={t('equipmentListing.stockTitle')}
      left="back"
      onBackPress={() => navigation.goBack()}
      headerStyle={styles.header}
      headerExtra={
        <View style={styles.tiles}>
          <Tile
            icon="cube-outline"
            label={t('equipmentListing.stockAvailable')}
            value={stock?.availableUnits ?? 0}
          />
          <Tile
            icon="key-outline"
            label={t('equipmentListing.stockOnRent')}
            value={stock?.rentUnits ?? 0}
          />
          <Tile
            icon="pricetag-outline"
            label={t('equipmentListing.stockSold')}
            value={stock?.saleUnits ?? 0}
          />
        </View>
      }
      contentContainerStyle={styles.content}
    >
      {loading && !stock ? (
        <ActivityIndicator color={palette.gold} style={styles.loader} />
      ) : (
        <>
          <AppText weight="bold" style={styles.sectionTitle}>
            {t('equipmentListing.stockRecords')}
          </AppText>

          {active.length === 0 && returned.length === 0 ? (
            <View style={styles.emptyCard}>
              <Ionicons name="file-tray-outline" size={28} color={palette.gold} />
              <AppText style={styles.empty}>{t('equipmentListing.stockEmpty')}</AppText>
            </View>
          ) : null}

          {active.map((hold) => (
            <EquipmentDealCard
              key={hold.id}
              hold={hold}
              dateLabel={formatDealDate(appI18n.language, hold.createdAt)}
              kindLabel={hold.kind === 'rent' ? t('equipmentListing.rent') : t('equipmentListing.sell')}
              unitsLabel={t('equipmentListing.unitsCount', { count: hold.units })}
              currencyCode={currency.code}
              perUnitLabel={t('rfq.pricePerUnit')}
              action={
                hold.kind === 'rent' && hold.status === 'active' ? (
                  <Button
                    label={t('equipmentListing.returnToCatalog')}
                    variant="outline"
                    loading={returningId === hold.id}
                    disabled={returningId != null}
                    onPress={() => returnHold(hold)}
                  />
                ) : null
              }
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
        </>
      )}
    </GoldSheetScreen>
  );
}

function Tile({
  icon,
  label,
  value,
}: {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  label: string;
  value: number;
}): React.ReactElement {
  return (
    <View style={[styles.tile, cardBackShadow]}>
      <Ionicons name={icon} size={18} color={palette.gold} />
      <AppText weight="bold" style={styles.tileValue}>
        {value}
      </AppText>
      <AppText style={styles.tileLabel}>{label}</AppText>
    </View>
  );
}

function formatDealDate(locale: string, epoch: number): string {
  return new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }).format(new Date(epoch));
}

const styles = StyleSheet.create({
  header: { paddingBottom: spacing.sm },
  loader: { marginTop: spacing.xxl },
  content: { padding: spacing.lg, gap: spacing.md, paddingBottom: spacing.xxl },
  tiles: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl + spacing.sm,
    backgroundColor: palette.gold,
  },
  tile: {
    flex: 1,
    backgroundColor: palette.warmWhite,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: palette.softGold,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xs,
    alignItems: 'center',
    gap: spacing.xs,
  },
  tileValue: { fontSize: 22, color: palette.charcoal },
  tileLabel: { fontSize: 11, color: palette.muted, textAlign: 'center' },
  sectionTitle: { fontSize: 16, color: palette.charcoal, marginTop: spacing.sm },
  emptyCard: {
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: palette.warmWhite,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: palette.softGold,
    padding: spacing.xl,
  },
  empty: { color: palette.muted, fontSize: 14, textAlign: 'center' },
});
