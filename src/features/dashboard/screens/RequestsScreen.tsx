import React from 'react';
import { RefreshControl, StyleSheet, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { CompositeScreenProps } from '@react-navigation/native';
import { useFocusEffect } from '@react-navigation/native';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { useTranslation } from 'react-i18next';
import { i18n as appI18n } from '@/i18n';
import type {
  DashboardTabParamList,
  ListingCategory,
  RootStackParamList,
} from '@/navigation/types';
import { GoldSheetScreen } from '@/features/dashboard/components/GoldSheetScreen';
import { SegmentedSwitcher } from '@/shared/components/SegmentedSwitcher';
import { EmptyState } from '@/shared/components/EmptyState';
import { ListingCard } from '@/features/listings/components/ListingCard';
import { useListingsStore } from '@/store/listingsStore';
import { useServiceListingsStore } from '@/store/serviceListingsStore';
import { useGoldListingsStore } from '@/store/goldListingsStore';
import { useMarketplaceRoleStore } from '@/store/marketplaceRoleStore';
import { refreshListings } from '@/features/listings/utils/refreshListings';
import { buildListingCards } from '@/features/listings/utils/buildListingCards';
import { useCurrency } from '@/shared/hooks/useCurrency';
import { palette, spacing } from '@/theme';

type Props = CompositeScreenProps<
  BottomTabScreenProps<DashboardTabParamList, 'Requests'>,
  NativeStackScreenProps<RootStackParamList>
>;

export function RequestsScreen({ navigation, route }: Props): React.ReactElement {
  const { t } = useTranslation(undefined, { i18n: appI18n });
  const currency = useCurrency();
  const equipmentListings = useListingsStore((state) => state.listings);
  const serviceListings = useServiceListingsStore((state) => state.listings);
  const goldListings = useGoldListingsStore((state) => state.listings);
  const role = useMarketplaceRoleStore((state) => state.role);
  const [category, setCategory] = React.useState<ListingCategory>(
    route.params?.category ?? 'equipment',
  );

  React.useEffect(() => {
    if (route.params?.category) {
      setCategory(route.params.category);
    }
  }, [route.params?.category]);
  const [refreshing, setRefreshing] = React.useState(false);

  useFocusEffect(
    React.useCallback(() => {
      void refreshListings(role).catch(() => undefined);
    }, [role]),
  );

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    void refreshListings(role)
      .catch(() => undefined)
      .finally(() => setRefreshing(false));
  }, [role]);

  const categoryOptions = [
    { key: 'equipment' as const, label: t('requests.categoryEquipment') },
    { key: 'services' as const, label: t('requests.categoryServices') },
    ...(role === 'supplier' ? [{ key: 'gold' as const, label: t('requests.categoryGold') }] : []),
  ];

  React.useEffect(() => {
    if (role === 'buyer' && category === 'gold') {
      setCategory('equipment');
    }
  }, [role, category]);

  const cards = buildListingCards({
    category,
    equipmentListings,
    serviceListings,
    goldListings,
    t,
    currencyCode: currency.code,
    onOpen: (id, listingCategory) =>
      navigation.navigate('CompleteListingDetail', { id, category: listingCategory }),
  });

  return (
    <GoldSheetScreen
      title={t('requests.title')}
      titleAlign="left"
      titleSize="lg"
      headerStyle={styles.header}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={palette.gold} />
      }
      headerExtra={
        <View style={styles.switcherWrap}>
          <SegmentedSwitcher value={category} onChange={setCategory} options={categoryOptions} />
        </View>
      }
    >
      {cards.length === 0 ? (
        <EmptyState title={t('requests.emptyTitle')} subtitle={t('requests.emptySubtitle')} />
      ) : (
        cards.map(({ id, ...card }) => <ListingCard key={id} {...card} />)
      )}
    </GoldSheetScreen>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingBottom: spacing.lg,
  },
  switcherWrap: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xl,
    backgroundColor: palette.gold,
  },
});
