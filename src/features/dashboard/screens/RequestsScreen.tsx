import React from 'react';
import { I18nManager, Pressable, RefreshControl, StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
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
import { AppText } from '@/shared/components/AppText';
import { useListingsStore } from '@/store/listingsStore';
import { useServiceListingsStore } from '@/store/serviceListingsStore';
import { useGoldListingsStore } from '@/store/goldListingsStore';
import { useMarketplaceRoleStore } from '@/store/marketplaceRoleStore';
import { refreshListings } from '@/features/listings/utils/refreshListings';
import { buildListingCards } from '@/features/listings/utils/buildListingCards';
import { useCurrency } from '@/shared/hooks/useCurrency';
import { useAbortableFocusLoad } from '@/shared/hooks/useAbortableFocusLoad';
import { palette, spacing } from '@/theme';

type Props = CompositeScreenProps<
  BottomTabScreenProps<DashboardTabParamList, 'Requests'>,
  NativeStackScreenProps<RootStackParamList>
>;

type LifeFilter = 'live' | 'past';

export function RequestsScreen({ navigation, route }: Props): React.ReactElement {
  const { t } = useTranslation(undefined, { i18n: appI18n });
  const catalogLabel = useLocalizedCatalogLabel();
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
  const [lifeFilter, setLifeFilter] = React.useState<LifeFilter>('live');
  const [lifeRowWidth, setLifeRowWidth] = React.useState(0);
  const hasCachedData = equipmentListings.length + serviceListings.length + goldListings.length > 0;

  const { loadError, refreshing, onRefresh, retry } = useAbortableFocusLoad(
    (signal) => refreshListings(role, { signal }),
    [role],
  );

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

  const visibleCards = React.useMemo(() => {
    const cards = buildListingCards({
      category,
      equipmentListings,
      serviceListings,
      goldListings,
      t,
      currencyCode: currency.code,
      catalogLabel,
      onOpen: (id, listingCategory) =>
        navigation.navigate('CompleteListingDetail', { id, category: listingCategory }),
      onRepost: (id, listingCategory) => {
        if (listingCategory === 'equipment') {
          navigation.navigate('EquipmentListingForm', { repostId: id });
          return;
        }
        if (listingCategory === 'services') {
          navigation.navigate('ServiceListingForm', { repostId: id });
          return;
        }
        navigation.navigate('GoldListingForm', { repostId: id });
      },
    });
    return cards.filter((card) => (lifeFilter === 'past' ? Boolean(card.ended) : !card.ended));
  }, [
    catalogLabel,
    category,
    currency.code,
    equipmentListings,
    goldListings,
    lifeFilter,
    navigation,
    serviceListings,
    t,
  ]);

  const emptyTitle =
    lifeFilter === 'live' ? t('requests.emptyLiveTitle') : t('requests.emptyPastTitle');
  const emptySubtitle =
    lifeFilter === 'live' ? t('requests.emptyLiveSubtitle') : t('requests.emptyPastSubtitle');

  const lifeOptions: { key: LifeFilter; label: string }[] = [
    { key: 'live', label: t('requests.filterLive') },
    { key: 'past', label: t('requests.filterPast') },
  ];
  const lifeIndex = Math.max(
    0,
    lifeOptions.findIndex((option) => option.key === lifeFilter),
  );
  const lifeIndicator = useSharedValue(lifeIndex);
  React.useEffect(() => {
    lifeIndicator.value = withTiming(lifeIndex, { duration: 240 });
  }, [lifeIndex, lifeIndicator]);
  const lifeTabWidth = lifeRowWidth / lifeOptions.length;
  const lifeIndicatorStyle = useAnimatedStyle(() => {
    const visualIndex = I18nManager.isRTL
      ? lifeOptions.length - 1 - lifeIndicator.value
      : lifeIndicator.value;
    return {
      width: lifeTabWidth,
      transform: [{ translateX: visualIndex * lifeTabWidth }],
    };
  }, [lifeTabWidth]);

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
      <View style={styles.lifeRow}>
        <View
          style={styles.lifeTrack}
          onLayout={(event) => setLifeRowWidth(event.nativeEvent.layout.width)}
        >
          {lifeOptions.map((option) => {
            const selected = option.key === lifeFilter;
            return (
              <Pressable
                key={option.key}
                onPress={() => setLifeFilter(option.key)}
                accessibilityRole="tab"
                accessibilityState={{ selected }}
                style={({ pressed }) => [styles.lifeTab, pressed && styles.lifeTabPressed]}
              >
                <AppText
                  weight={selected ? 'bold' : 'medium'}
                  style={[styles.lifeTabLabel, selected && styles.lifeTabLabelSelected]}
                  numberOfLines={1}
                >
                  {option.label}
                </AppText>
              </Pressable>
            );
          })}
          {lifeTabWidth > 0 ? (
            <Animated.View style={[styles.lifeTabLine, lifeIndicatorStyle]} />
          ) : null}
        </View>
      </View>

      {loadError && !hasCachedData ? (
        <ErrorState
          title={t('common.loadFailed')}
          subtitle={t('common.loadFailedSubtitle')}
          retryLabel={t('common.retry')}
          onRetry={retry}
        />
      ) : visibleCards.length === 0 ? (
        <EmptyState title={emptyTitle} subtitle={emptySubtitle} />
      ) : (
        visibleCards.map(({ id, ...card }) => <ListingCard key={`${category}-${id}`} {...card} />)
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
  lifeRow: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: palette.softGold,
    marginHorizontal: -spacing.md,
    paddingHorizontal: spacing.md,
  },
  lifeTrack: {
    flexDirection: 'row',
  },
  lifeTab: {
    flex: 1,
    alignItems: 'center',
    paddingTop: spacing.xs,
    paddingBottom: spacing.sm,
  },
  lifeTabPressed: {
    opacity: 0.75,
  },
  lifeTabLabel: {
    fontSize: 14,
    color: palette.muted,
  },
  lifeTabLabelSelected: {
    color: palette.gold,
  },
  lifeTabLine: {
    position: 'absolute',
    left: 0,
    bottom: 0,
    height: 2,
    borderRadius: 1,
    backgroundColor: palette.gold,
  },
});
