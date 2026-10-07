import React from 'react';
import { RefreshControl, StyleSheet, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { CompositeScreenProps } from '@react-navigation/native';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { useTranslation } from 'react-i18next';
import { i18n as appI18n } from '@/i18n';
import type {
  DashboardTabParamList,
  ListingCategory,
  RootStackParamList,
} from '@/navigation/types';
import { GoldSheetScreen } from '@/features/dashboard/components/GoldSheetScreen';
import { useLocalizedCatalogLabel } from '@/features/listings/utils/catalogLabels';
import { SegmentedSwitcher } from '@/shared/components/SegmentedSwitcher';
import { EmptyState } from '@/shared/components/EmptyState';
import { ErrorState } from '@/shared/components/ErrorState';
import { ListingCard } from '@/features/listings/components/ListingCard';
import {
  isEquipmentListing,
  isGoldListing,
  isServiceListing,
} from '@/features/listings/api/listingsApi';
import { useOfferedListingsStore } from '@/store/offeredListingsStore';
import { useMarketplaceRoleStore } from '@/store/marketplaceRoleStore';
import { refreshOfferedListings } from '@/features/listings/utils/refreshListings';
import { buildListingCards } from '@/features/listings/utils/buildListingCards';
import { useCurrency } from '@/shared/hooks/useCurrency';
import { useAbortableFocusLoad } from '@/shared/hooks/useAbortableFocusLoad';
import { palette, spacing } from '@/theme';

type Props = CompositeScreenProps<
  BottomTabScreenProps<DashboardTabParamList, 'MyOffers'>,
  NativeStackScreenProps<RootStackParamList>
>;

export function MyOffersScreen({ navigation }: Props): React.ReactElement {
  const { t } = useTranslation(undefined, { i18n: appI18n });
  const catalogLabel = useLocalizedCatalogLabel();
  const currency = useCurrency();
  const listings = useOfferedListingsStore((state) => state.listings);
  const role = useMarketplaceRoleStore((state) => state.role);
  const [category, setCategory] = React.useState<ListingCategory>('equipment');
  const hasCachedData = listings.length > 0;

  React.useEffect(() => {
    if (role !== 'buyer' && category === 'gold') {
      setCategory('equipment');
    }
  }, [role, category]);

  const { loadError, refreshing, onRefresh, retry } = useAbortableFocusLoad(
    (signal) => refreshOfferedListings({ signal }),
    [],
  );

  const sentInThisMode = listings.filter((listing) =>
    role === 'buyer' ? listing.postedAs === 'supplier' : listing.postedAs === 'buyer',
  );

  const cards = buildListingCards({
    category,
    equipmentListings: sentInThisMode.filter(isEquipmentListing),
    serviceListings: sentInThisMode.filter(isServiceListing),
    goldListings: sentInThisMode.filter(isGoldListing),
    t,
    currencyCode: currency.code,
    catalogLabel,
    onOpen: (id, listingCategory) =>
      navigation.navigate('CompleteListingDetail', { id, category: listingCategory }),
  });

  return (
    <GoldSheetScreen
      title={t('offers.title')}
      titleAlign="left"
      titleSize="lg"
      headerStyle={styles.header}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={palette.gold} />
      }
      headerExtra={
        <View style={styles.switcherWrap}>
          <SegmentedSwitcher
            value={category}
            onChange={setCategory}
            options={[
              { key: 'equipment' as const, label: t('requests.categoryEquipment') },
              { key: 'services' as const, label: t('requests.categoryServices') },
              ...(role === 'buyer'
                ? [{ key: 'gold' as const, label: t('requests.categoryGold') }]
                : []),
            ]}
          />
        </View>
      }
    >
      {loadError && !hasCachedData ? (
        <ErrorState
          title={t('common.loadFailed')}
          subtitle={t('common.loadFailedSubtitle')}
          retryLabel={t('common.retry')}
          onRetry={retry}
        />
      ) : cards.length === 0 ? (
        <EmptyState title={t('offers.emptyTitle')} subtitle={t('offers.emptySubtitle')} />
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
