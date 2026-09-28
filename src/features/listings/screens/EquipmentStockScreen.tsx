import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { i18n as appI18n } from '@/i18n';
import type { RootStackParamList } from '@/navigation/types';
import { GoldSheetScreen } from '@/features/dashboard/components/GoldSheetScreen';
import { AppText } from '@/shared/components/AppText';
import { Button } from '@/shared/components/Button';
import { showAppAlert } from '@/shared/services/appAlert';
import { ApiError } from '@/shared/services/api';
import {
  listingsApi,
  type EquipmentStock,
  type EquipmentStockHold,
} from '@/features/listings/api/listingsApi';
import { palette, radius, spacing } from '@/theme';

type Props = NativeStackScreenProps<RootStackParamList, 'EquipmentStock'>;

export function EquipmentStockScreen({ navigation, route }: Props): React.ReactElement {
  const { id } = route.params;
  const { t } = useTranslation(undefined, { i18n: appI18n });
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
    setReturningId(hold.id);
    void listingsApi
      .returnRentedUnits(id, hold.id)
      .then(setStock)
      .catch((error: unknown) => {
        const message = error instanceof ApiError ? error.message : t('common.error');
        showAppAlert(t('common.error'), message);
      })
      .finally(() => setReturningId(null));
  };

  const active = stock?.holds.filter((hold) => hold.status === 'active') ?? [];
  const returned = stock?.holds.filter((hold) => hold.status === 'returned') ?? [];

  return (
    <GoldSheetScreen
      title={t('equipmentListing.stockTitle')}
      left="back"
      onBackPress={() => navigation.goBack()}
      contentContainerStyle={styles.content}
    >
      {loading && !stock ? (
        <ActivityIndicator color={palette.gold} style={styles.loader} />
      ) : (
        <>
          <View style={styles.tiles}>
            <Tile label={t('equipmentListing.stockAvailable')} value={stock?.availableUnits ?? 0} />
            <Tile label={t('equipmentListing.stockOnRent')} value={stock?.rentUnits ?? 0} />
            <Tile label={t('equipmentListing.stockSold')} value={stock?.saleUnits ?? 0} />
          </View>

          <AppText weight="bold" style={styles.sectionTitle}>
            {t('equipmentListing.stockRecords')}
          </AppText>

          {active.length === 0 && returned.length === 0 ? (
            <AppText style={styles.empty}>{t('equipmentListing.stockEmpty')}</AppText>
          ) : null}

          {active.map((hold) => (
            <View key={hold.id} style={styles.card}>
              <AppText weight="semibold" style={styles.cardTitle}>
                {hold.buyerName} · {hold.kind === 'rent' ? t('equipmentListing.rent') : t('equipmentListing.sell')}
              </AppText>
              <AppText style={styles.cardMeta}>
                {t('equipmentListing.unitsCount', { count: hold.units })}
              </AppText>
              {hold.kind === 'rent' && hold.status === 'active' ? (
                <Button
                  label={t('equipmentListing.returnToCatalog')}
                  variant="outline"
                  loading={returningId === hold.id}
                  disabled={returningId != null}
                  onPress={() => returnHold(hold)}
                />
              ) : null}
            </View>
          ))}

          {returned.map((hold) => (
            <View key={hold.id} style={[styles.card, styles.cardMuted]}>
              <AppText weight="semibold" style={styles.cardTitle}>
                {hold.buyerName} · {t('equipmentListing.rent')}
              </AppText>
              <AppText style={styles.cardMeta}>
                {t('equipmentListing.unitsCount', { count: hold.units })} · {t('equipmentListing.stockReturned')}
              </AppText>
            </View>
          ))}
        </>
      )}
    </GoldSheetScreen>
  );
}

function Tile({ label, value }: { label: string; value: number }): React.ReactElement {
  return (
    <View style={styles.tile}>
      <AppText weight="bold" style={styles.tileValue}>
        {value}
      </AppText>
      <AppText style={styles.tileLabel}>{label}</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  loader: { marginTop: spacing.xxl },
  content: { padding: spacing.lg, gap: spacing.md, paddingBottom: spacing.xxl },
  tiles: { flexDirection: 'row', gap: spacing.sm },
  tile: {
    flex: 1,
    backgroundColor: palette.warmWhite,
    borderRadius: radius.md,
    padding: spacing.md,
    gap: spacing.xs,
  },
  tileValue: { fontSize: 22, color: palette.charcoal },
  tileLabel: { fontSize: 12, color: palette.muted },
  sectionTitle: { fontSize: 16, color: palette.charcoal, marginTop: spacing.sm },
  empty: { color: palette.muted, fontSize: 14 },
  card: {
    borderWidth: 1,
    borderColor: palette.softGold,
    borderRadius: radius.md,
    padding: spacing.md,
    gap: spacing.sm,
  },
  cardMuted: { opacity: 0.7 },
  cardTitle: { fontSize: 15, color: palette.charcoal },
  cardMeta: { fontSize: 13, color: palette.muted },
});
