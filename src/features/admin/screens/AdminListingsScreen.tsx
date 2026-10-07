import React from 'react';
import { ActivityIndicator, RefreshControl, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { i18n as appI18n } from '@/i18n';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { GoldSheetScreen } from '@/features/dashboard/components/GoldSheetScreen';
import type { ListingCategory, RootStackParamList } from '@/navigation/types';
import { SegmentedSwitcher } from '@/shared/components/SegmentedSwitcher';
import { ListingCard } from '@/features/listings/components/ListingCard';
import {
  isEquipmentListing,
  isGoldListing,
  isServiceListing,
} from '@/features/listings/api/listingsApi';
import { buildListingCards } from '@/features/listings/utils/buildListingCards';
import { useLocalizedCatalogLabel } from '@/features/listings/utils/catalogLabels';
import { useCurrency } from '@/shared/hooks/useCurrency';
import { adminApi, type AdminListingItem } from '@/features/admin/api/adminApi';
import { EmptyState } from '@/shared/components/EmptyState';
import { SearchField } from '@/shared/components/SearchField';
import { showAppAlert } from '@/shared/services/appAlert';
import { palette, spacing } from '@/theme';

export function AdminListingsScreen(): React.ReactElement {
  const { t } = useTranslation(undefined, { i18n: appI18n });
  const catalogLabel = useLocalizedCatalogLabel();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const currency = useCurrency();
  const [category, setCategory] = React.useState<ListingCategory>('equipment');
  const [query, setQuery] = React.useState('');
  const [items, setItems] = React.useState<AdminListingItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [refreshing, setRefreshing] = React.useState(false);

  const load = React.useCallback(async (search: string, nextCategory: string) => {
    const result = await adminApi.listListings({
      search,
      category: nextCategory === 'all' ? undefined : nextCategory,
      status: 'live',
    });
    setItems(result.items);
  }, []);

  React.useEffect(() => {
    const handle = setTimeout(
      () => {
        setLoading(true);
        void load(query, category)
          .catch(() => showAppAlert(t('admin.loadFailed')))
          .finally(() => setLoading(false));
      },
      query ? 300 : 0,
    );
    return () => clearTimeout(handle);
  }, [query, category, load, t]);

  const cards = buildListingCards({
    category,
    equipmentListings: items.filter(isEquipmentListing),
    serviceListings: items.filter(isServiceListing),
    goldListings: items.filter(isGoldListing),
    t,
    currencyCode: currency.code,
    catalogLabel,
    onOpen: (id, listingCategory) =>
      navigation.navigate('CompleteListingDetail', { id, category: listingCategory }),
  });

  return (
    <GoldSheetScreen
      title={t('requests.title')}
      titleAlign="left"
      titleSize="lg"
      headerStyle={styles.header}
      headerExtra={
        <View style={styles.switcherWrap}>
          <SegmentedSwitcher
            value={category}
            onChange={setCategory}
            options={[
              { key: 'equipment', label: t('requests.categoryEquipment') },
              { key: 'services', label: t('requests.categoryServices') },
              { key: 'gold', label: t('requests.categoryGold') },
            ]}
          />
        </View>
      }
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => {
            setRefreshing(true);
            void load(query, category).finally(() => setRefreshing(false));
          }}
        />
      }
    >
      <SearchField value={query} onChangeText={setQuery} placeholder={t('admin.searchListings')} />
      {loading ? (
        <ActivityIndicator color={palette.gold} style={styles.loader} />
      ) : items.length === 0 ? (
        <EmptyState title={t('admin.emptyListings')} />
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
  loader: { marginTop: spacing.xl },
});
