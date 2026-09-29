import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
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
import { useCurrency } from '@/shared/hooks/useCurrency';
import { formatMoneyAmount, parsePositiveAmount } from '@/shared/utils/formatAmount';
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
          text: t('equipmentListing.returnToCatalog'),
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
      contentContainerStyle={styles.content}
    >
      {loading && !stock ? (
        <ActivityIndicator color={palette.gold} style={styles.loader} />
      ) : (
        <>
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
            <DealCard
              key={hold.id}
              hold={hold}
              dateLabel={formatDealDate(appI18n.language, hold.createdAt)}
              kindLabel={hold.kind === 'rent' ? t('equipmentListing.rent') : t('equipmentListing.sell')}
              unitsLabel={t('equipmentListing.unitsCount', { count: hold.units })}
              currencyCode={currency.code}
              perUnitLabel={t('equipmentListing.stockPerUnit')}
              unitsTileLabel={t('equipmentListing.stockDealUnits')}
              totalLabel={t('equipmentListing.stockDealTotal')}
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
            <DealCard
              key={hold.id}
              hold={hold}
              muted
              dateLabel={formatDealDate(appI18n.language, hold.createdAt)}
              kindLabel={t('equipmentListing.rent')}
              unitsLabel={t('equipmentListing.unitsCount', { count: hold.units })}
              currencyCode={currency.code}
              perUnitLabel={t('equipmentListing.stockPerUnit')}
              unitsTileLabel={t('equipmentListing.stockDealUnits')}
              totalLabel={t('equipmentListing.stockDealTotal')}
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

function DealCard({
  hold,
  dateLabel,
  kindLabel,
  unitsLabel,
  currencyCode,
  perUnitLabel,
  unitsTileLabel,
  totalLabel,
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
  unitsTileLabel: string;
  totalLabel: string;
  statusLabel?: string;
  muted?: boolean;
  action?: React.ReactNode;
}): React.ReactElement {
  const total = parsePositiveAmount(hold.price);
  const unitAmount =
    total != null && hold.units > 0 ? Math.round((total / hold.units) * 100) / 100 : null;
  return (
    <View style={[styles.card, muted && styles.cardMuted]}>
      <View style={styles.cardRow}>
        <View style={styles.cardCopy}>
          <AppText weight="semibold" style={styles.cardTitle} numberOfLines={1}>
            {hold.buyerName}
          </AppText>
          <AppText style={styles.cardMeta} numberOfLines={1}>
            {unitsLabel} · {dateLabel}
          </AppText>
          {unitAmount != null ? (
            <AppText weight="semibold" style={styles.cardPrice}>
              {formatMoneyAmount(currencyCode, unitAmount)} {perUnitLabel}
            </AppText>
          ) : null}
        </View>
        <View style={[styles.chip, muted && styles.chipMuted]}>
          <AppText weight="semibold" style={[styles.chipText, muted && styles.chipTextMuted]}>
            {statusLabel ?? kindLabel}
          </AppText>
        </View>
      </View>
      {unitAmount != null && total != null ? (
        <View style={styles.calcRow}>
          <CalcTile label={perUnitLabel} value={formatMoneyAmount(currencyCode, unitAmount)} />
          <CalcTile label={unitsTileLabel} value={String(hold.units)} />
          <CalcTile label={totalLabel} value={formatMoneyAmount(currencyCode, total)} />
        </View>
      ) : null}
      {action}
    </View>
  );
}

function CalcTile({ label, value }: { label: string; value: string }): React.ReactElement {
  return (
    <View style={styles.calcTile}>
      <AppText weight="bold" style={styles.calcValue} numberOfLines={1}>
        {value}
      </AppText>
      <AppText style={styles.calcLabel} numberOfLines={1}>
        {label}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  loader: { marginTop: spacing.xxl },
  content: { padding: spacing.lg, gap: spacing.md, paddingBottom: spacing.xxl },
  tiles: { flexDirection: 'row', gap: spacing.sm },
  tile: {
    flex: 1,
    backgroundColor: palette.pureWhite,
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
  card: {
    backgroundColor: palette.pureWhite,
    borderWidth: 1,
    borderColor: palette.softGold,
    borderRadius: radius.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  cardMuted: { backgroundColor: palette.warmWhite },
  cardRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  cardCopy: { flex: 1, gap: 2 },
  cardTitle: { fontSize: 15, color: palette.charcoal },
  cardMeta: { fontSize: 13, color: palette.muted },
  cardPrice: { fontSize: 14, color: palette.goldDark, marginTop: 2 },
  calcRow: { flexDirection: 'row', gap: spacing.xs },
  calcTile: {
    flex: 1,
    backgroundColor: palette.warmWhite,
    borderRadius: radius.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs,
    alignItems: 'center',
    gap: 2,
  },
  calcValue: { fontSize: 13, color: palette.charcoal },
  calcLabel: { fontSize: 10, color: palette.muted, textAlign: 'center' },
  chip: {
    backgroundColor: palette.softGold,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
  },
  chipMuted: { backgroundColor: palette.pureWhite },
  chipText: { fontSize: 12, color: palette.goldDark },
  chipTextMuted: { color: palette.muted },
});
