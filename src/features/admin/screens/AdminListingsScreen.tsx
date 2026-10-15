import React from 'react';
import {
  ActivityIndicator,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  RefreshControl,
  StyleSheet,
  View,
} from 'react-native';
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

const PAGE_SIZE = 7;

export function AdminListingsScreen(): React.ReactElement {
  const { t } = useTranslation(undefined, { i18n: appI18n });
  const catalogLabel = useLocalizedCatalogLabel();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const currency = useCurrency();
  const [side, setSide] = React.useState<'supplier' | 'buyer'>('supplier');
  const [category, setCategory] = React.useState<ListingCategory>('equipment');
  const [query, setQuery] = React.useState('');
  const [items, setItems] = React.useState<AdminListingItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [loadingMore, setLoadingMore] = React.useState(false);
  const [hasMore, setHasMore] = React.useState(false);
  const [refreshing, setRefreshing] = React.useState(false);
  const pageRef = React.useRef(1);
  const loadingMoreRef = React.useRef(false);
  const requestId = React.useRef(0);
  const viewportHeight = React.useRef(0);

  const load = React.useCallback(
    async (
      search: string,
      nextCategory: string,
      nextSide: 'supplier' | 'buyer',
      page: number,
      append: boolean,
    ) => {
      const id = append ? requestId.current : ++requestId.current;
      const result = await adminApi.listListings({
        search,
        category: nextCategory === 'all' ? undefined : nextCategory,
        postedAs: nextSide,
        status: 'live',
        page,
      });
      if (id !== requestId.current) return;
      const nextItems = result.items.filter((item) => item.postedAs === nextSide);
      setItems((current) => {
        if (!append) return nextItems;
        const seen = new Set(current.map((item) => item.id));
        return [...current, ...nextItems.filter((item) => !seen.has(item.id))];
      });
      pageRef.current = page;
      setHasMore(result.hasMore ?? nextItems.length === PAGE_SIZE);
    },
    [],
  );

  React.useEffect(() => {
    const handle = setTimeout(
      () => {
        setLoading(true);
        setHasMore(false);
        void load(query, category, side, 1, false)
          .catch(() => showAppAlert(t('admin.loadFailed')))
          .finally(() => setLoading(false));
      },
      query ? 300 : 0,
    );
    return () => clearTimeout(handle);
  }, [query, category, side, load, t]);

  const loadMore = React.useCallback(() => {
    if (loading || refreshing || !hasMore || loadingMoreRef.current) return;
    loadingMoreRef.current = true;
    setLoadingMore(true);
    void load(query, category, side, pageRef.current + 1, true)
      .catch(() => showAppAlert(t('admin.loadFailed')))
      .finally(() => {
        loadingMoreRef.current = false;
        setLoadingMore(false);
      });
  }, [category, hasMore, load, loading, query, refreshing, side, t]);

  const onScroll = React.useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
      const distanceFromBottom = contentSize.height - layoutMeasurement.height - contentOffset.y;
      if (distanceFromBottom < 240) loadMore();
    },
    [loadMore],
  );

  const onContentSizeChange = React.useCallback(
    (_width: number, height: number) => {
      if (height <= viewportHeight.current + 48) loadMore();
    },
    [loadMore],
  );

  const cards = React.useMemo(
    () =>
      buildListingCards({
        category,
        equipmentListings: items.filter(isEquipmentListing),
        serviceListings: items.filter(isServiceListing),
        goldListings: items.filter(isGoldListing),
        t,
        currencyCode: currency.code,
        catalogLabel,
        onOpen: (id, listingCategory) =>
          navigation.navigate('CompleteListingDetail', { id, category: listingCategory }),
      }),
    [catalogLabel, category, currency.code, items, navigation, t],
  );

  return (
    <GoldSheetScreen
      title={t('requests.title')}
      titleAlign="left"
      titleSize="lg"
      headerStyle={styles.header}
      headerExtra={
        <View style={styles.switcherWrap}>
          <SegmentedSwitcher
            value={side}
            onChange={(next) => {
              setItems([]);
              setLoading(true);
              setSide(next);
              if (next === 'buyer' && category === 'gold') setCategory('equipment');
            }}
            options={[
              { key: 'supplier', label: t('dashboardHome.supplier') },
              { key: 'buyer', label: t('dashboardHome.buyer') },
            ]}
          />
          <SegmentedSwitcher
            value={category}
            onChange={(next) => {
              setItems([]);
              setLoading(true);
              setCategory(next);
            }}
            options={[
              { key: 'equipment', label: t('requests.categoryEquipment') },
              { key: 'services', label: t('requests.categoryServices') },
              ...(side === 'supplier'
                ? [{ key: 'gold' as const, label: t('requests.categoryGold') }]
                : []),
            ]}
          />
        </View>
      }
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => {
            setRefreshing(true);
            void load(query, category, side, 1, false).finally(() => setRefreshing(false));
          }}
        />
      }
      onScroll={onScroll}
      scrollEventThrottle={16}
      onLayout={(event) => {
        viewportHeight.current = event.nativeEvent.layout.height;
      }}
      onContentSizeChange={onContentSizeChange}
    >
      <SearchField value={query} onChangeText={setQuery} placeholder={t('admin.searchListings')} />
      {loading ? (
        <ActivityIndicator color={palette.gold} style={styles.loader} />
      ) : items.length === 0 ? (
        <EmptyState title={t('admin.emptyListings')} />
      ) : (
        <>
          {cards.map(({ id, ...card }) => (
            <ListingCard key={id} {...card} />
          ))}
          {loadingMore ? <ActivityIndicator color={palette.gold} style={styles.loader} /> : null}
        </>
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
    gap: spacing.sm,
  },
  loader: { marginTop: spacing.xl },
});
