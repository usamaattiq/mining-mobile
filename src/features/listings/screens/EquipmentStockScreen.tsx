import React from 'react';
import { ActivityIndicator, Image, Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { i18n as appI18n } from '@/i18n';
import type { RootStackParamList } from '@/navigation/types';
import { GoldSheetScreen } from '@/features/dashboard/components/GoldSheetScreen';
import { EquipmentDealCard } from '@/features/listings/components/EquipmentDealCard';
import {
  isEquipmentListing,
  listingsApi,
  type EquipmentStock,
  type EquipmentStockHold,
  type ListingDto,
} from '@/features/listings/api/listingsApi';
import { AppText } from '@/shared/components/AppText';
import { EmptyState } from '@/shared/components/EmptyState';
import { Button } from '@/shared/components/Button';
import { showAppAlert } from '@/shared/services/appAlert';
import { ApiError } from '@/shared/services/api';
import { useCurrency } from '@/shared/hooks/useCurrency';
import { cityFromLocationLabel } from '@/shared/utils/locationLabel';
import { cardBackShadow, palette, radius, spacing } from '@/theme';

type Props = NativeStackScreenProps<RootStackParamList, 'EquipmentStock'>;
type Tab = 'overview' | 'sold' | 'rented';

export function EquipmentStockScreen({ navigation, route }: Props): React.ReactElement {
  const { id } = route.params;
  const { t } = useTranslation(undefined, { i18n: appI18n });
  const currency = useCurrency();
  const [stock, setStock] = React.useState<EquipmentStock | null>(null);
  const [listing, setListing] = React.useState<ListingDto | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [returningId, setReturningId] = React.useState<string | null>(null);
  const [tab, setTab] = React.useState<Tab>('overview');

  const load = React.useCallback(() => {
    setLoading(true);
    void Promise.all([listingsApi.equipmentStock(id), listingsApi.get(id)])
      .then(([nextStock, nextListing]) => {
        setStock(nextStock);
        setListing(nextListing);
      })
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

  const equipment = listing && isEquipmentListing(listing) ? listing : null;
  const photo = equipment?.media.find((item) => item.kind === 'photo')?.uri;
  const city = cityFromLocationLabel(equipment?.location ?? '');
  const saleHolds = stock?.holds.filter((hold) => hold.kind === 'sale') ?? [];
  const rentHolds = stock?.holds.filter((hold) => hold.kind === 'rent') ?? [];
  const posted = equipment
    ? new Intl.DateTimeFormat(appI18n.language, {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }).format(new Date(equipment.createdAt))
    : '';

  return (
    <GoldSheetScreen
      title={t('equipmentListing.stockTitle')}
      left="back"
      onBackPress={() => navigation.goBack()}
      headerStyle={styles.header}
      contentContainerStyle={styles.content}
    >
      {loading && !stock ? (
        <ActivityIndicator color={palette.gold} style={styles.loader} />
      ) : (
        <>
          <View style={[styles.hero, cardBackShadow]}>
            {photo ? (
              <Image source={{ uri: photo }} style={styles.photo} />
            ) : (
              <View style={[styles.photo, styles.photoFallback]}>
                <Ionicons name="cube-outline" size={36} color={palette.gold} />
              </View>
            )}
            <View style={styles.heroBody}>
              <AppText weight="bold" style={styles.heroTitle} numberOfLines={2}>
                {equipment?.title ?? ''}
              </AppText>
              {city ? (
                <View style={styles.metaRow}>
                  <Ionicons name="location-outline" size={14} color={palette.muted} />
                  <AppText style={styles.meta} numberOfLines={1}>
                    {city}
                  </AppText>
                </View>
              ) : null}
              {equipment?.reference ? (
                <AppText style={styles.meta} numberOfLines={1}>
                  {t('equipmentListing.stockRef', { ref: equipment.reference })}
                </AppText>
              ) : null}
              {posted ? (
                <AppText style={styles.meta}>
                  {t('equipmentListing.stockPosted', { date: posted })}
                </AppText>
              ) : null}
            </View>
          </View>

          <View style={styles.tabs}>
            <TabButton
              label={t('equipmentListing.stockOverview')}
              active={tab === 'overview'}
              onPress={() => setTab('overview')}
            />
            <TabButton
              label={t('equipmentListing.stockSoldTab', { count: stock?.saleUnits ?? 0 })}
              active={tab === 'sold'}
              onPress={() => setTab('sold')}
            />
            <TabButton
              label={t('equipmentListing.stockRentedTab', { count: stock?.rentUnits ?? 0 })}
              active={tab === 'rented'}
              onPress={() => setTab('rented')}
            />
          </View>

          {tab === 'overview' ? (
            <View style={styles.grid}>
              <StatCard
                icon="cube-outline"
                label={t('equipmentListing.stockTotal')}
                value={stock?.totalUnits ?? 0}
                tone="gold"
              />
              <StatCard
                icon="checkmark-circle-outline"
                label={t('equipmentListing.stockAvailable')}
                value={stock?.availableUnits ?? 0}
                tone="soft"
              />
              <StatCard
                icon="time-outline"
                label={t('equipmentListing.stockOnRent')}
                value={stock?.rentUnits ?? 0}
                tone="white"
              />
              <StatCard
                icon="cart-outline"
                label={t('equipmentListing.stockSold')}
                value={stock?.saleUnits ?? 0}
                tone="cream"
              />
            </View>
          ) : null}

          {tab === 'sold' ? (
            <HoldList
              holds={saleHolds}
              kindLabel={t('equipmentListing.sell')}
              returningId={null}
              currencyCode={currency.code}
            />
          ) : null}

          {tab === 'rented' ? (
            <HoldList
              holds={rentHolds}
              kindLabel={t('equipmentListing.rent')}
              returningId={returningId}
              currencyCode={currency.code}
              onReturn={returnHold}
            />
          ) : null}
        </>
      )}
    </GoldSheetScreen>
  );
}

function HoldList({
  holds,
  kindLabel,
  returningId,
  currencyCode,
  onReturn,
}: {
  holds: EquipmentStockHold[];
  kindLabel: string;
  returningId: string | null;
  currencyCode: string;
  onReturn?: (hold: EquipmentStockHold) => void;
}): React.ReactElement {
  const { t } = useTranslation(undefined, { i18n: appI18n });
  if (holds.length === 0) {
    return <EmptyState title={t('equipmentListing.stockEmpty')} />;
  }
  return (
    <View style={styles.holdList}>
      {holds.map((hold) => (
        <EquipmentDealCard
          key={hold.id}
          hold={hold}
          muted={hold.status === 'returned'}
          dateLabel={formatDealDate(appI18n.language, hold.acceptedAt ?? hold.createdAt)}
          kindLabel={kindLabel}
          unitsLabel={t('equipmentListing.unitsCount', { count: hold.units })}
          currencyCode={currencyCode}
          statusLabel={hold.status === 'returned' ? t('equipmentListing.stockReturned') : undefined}
          action={
            hold.kind === 'rent' && hold.status === 'active' ? (
              <Button
                label={t('equipmentListing.returnToCatalog')}
                variant="outline"
                loading={returningId === hold.id}
                disabled={returningId != null}
                onPress={() => onReturn?.(hold)}
              />
            ) : null
          }
        />
      ))}
    </View>
  );
}

function TabButton({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}): React.ReactElement {
  return (
    <Pressable onPress={onPress} style={styles.tab}>
      <AppText
        weight={active ? 'bold' : 'medium'}
        style={[styles.tabLabel, active && styles.tabLabelActive]}
      >
        {label}
      </AppText>
      {active ? <View style={styles.tabLine} /> : <View style={styles.tabLineSpacer} />}
    </Pressable>
  );
}

function StatCard({
  icon,
  label,
  value,
  tone,
}: {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  label: string;
  value: number;
  tone: 'gold' | 'soft' | 'white' | 'cream';
}): React.ReactElement {
  const background =
    tone === 'gold'
      ? palette.softGold
      : tone === 'cream'
        ? palette.warmWhite
        : tone === 'soft'
          ? '#F7F3E6'
          : palette.pureWhite;
  return (
    <View style={[styles.stat, cardBackShadow, { backgroundColor: background }]}>
      <View style={styles.statIcon}>
        <Ionicons name={icon} size={18} color={palette.gold} />
      </View>
      <AppText style={styles.statLabel}>{label}</AppText>
      <AppText weight="bold" style={styles.statValue}>
        {value}
      </AppText>
    </View>
  );
}

function formatDealDate(locale: string, epoch: number): string {
  return new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }).format(new Date(epoch));
}

const styles = StyleSheet.create({
  header: { paddingBottom: spacing.xl },
  loader: { marginTop: spacing.xxl },
  content: { padding: spacing.lg, gap: spacing.md, paddingBottom: spacing.xxl },
  hero: {
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: spacing.sm,
    backgroundColor: palette.warmWhite,
    borderRadius: radius.lg,
    padding: spacing.sm,
  },
  photo: {
    alignSelf: 'stretch',
    aspectRatio: 1,
    minWidth: 96,
    minHeight: 96,
    borderRadius: radius.md,
    backgroundColor: palette.softGold,
  },
  photoFallback: { alignItems: 'center', justifyContent: 'center' },
  heroBody: { flex: 1, justifyContent: 'center', gap: 4 },
  heroTitle: { fontSize: 16, color: palette.charcoal },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  meta: { fontSize: 12, color: palette.muted, flexShrink: 1 },
  tabs: {
    flexDirection: 'row',
    gap: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: palette.softGold,
  },
  tab: { flex: 1, alignItems: 'center', paddingTop: spacing.xs },
  tabLabel: { fontSize: 12, color: palette.muted, textAlign: 'center' },
  tabLabelActive: { color: palette.gold },
  tabLine: {
    marginTop: spacing.sm,
    height: 2,
    width: '70%',
    borderRadius: 2,
    backgroundColor: palette.gold,
  },
  tabLineSpacer: { marginTop: spacing.sm, height: 2 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  stat: {
    width: '48%',
    flexGrow: 1,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: palette.softGold,
    padding: spacing.md,
    gap: spacing.xs,
    minHeight: 108,
  },
  statIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: palette.pureWhite,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statLabel: { fontSize: 12, color: palette.muted },
  statValue: { fontSize: 28, color: palette.charcoal },
  holdList: { gap: spacing.md },
});
