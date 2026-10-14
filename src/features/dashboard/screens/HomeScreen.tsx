import React from 'react';
import { Image, Pressable, RefreshControl, StyleSheet, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { CompositeScreenProps } from '@react-navigation/native';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { i18n as appI18n } from '@/i18n';
import type {
  DashboardTabParamList,
  ListingCategory,
  RootStackParamList,
} from '@/navigation/types';
import { GoldSheetScreen } from '@/features/dashboard/components/GoldSheetScreen';
import { useLocalizedCatalogLabel } from '@/features/listings/utils/catalogLabels';
import { NotificationBellButton } from '@/features/dashboard/components/NotificationBellButton';
import { SearchField } from '@/shared/components/SearchField';
import { HomeCategoryCards } from '@/features/dashboard/components/HomeCategoryCards';
import { EmptyState } from '@/shared/components/EmptyState';
import { ErrorState } from '@/shared/components/ErrorState';
import {
  HomeFilterSheet,
  dayKeyFromEpoch,
  type HomeTypeFilter,
} from '@/features/dashboard/components/HomeFilterSheet';
import {
  equipmentListingAmount,
  goldListingAmount,
  goldListingWeight,
  inNumericRange,
  matchesGoldKarat,
  parseFilterNumber,
  serviceListingAmount,
} from '@/features/dashboard/utils/homeFilterMatch';
import { cityFromLocationLabel } from '@/shared/utils/locationLabel';
import { serviceTypeFlags } from '@/features/listings/utils/serviceType';
import { ListingCard } from '@/features/listings/components/ListingCard';
import {
  isEquipmentListing,
  isGoldListing,
  isServiceListing,
  type ListingDto,
} from '@/features/listings/api/listingsApi';
import { useNotificationsStore } from '@/store/notificationsStore';
import { useMessagesStore } from '@/store/messagesStore';
import { useProfileStore } from '@/store/profileStore';
import { useMarketListingsStore } from '@/store/marketListingsStore';
import {
  confirmSwitchMarketplaceRole,
  oppositeMarketplaceRole,
  useMarketplaceRoleStore,
} from '@/store/marketplaceRoleStore';
import { notificationsApi } from '@/features/dashboard/api/notificationsApi';
import { refreshMarketListings } from '@/features/listings/utils/refreshListings';
import {
  listingHasMyOffer,
  listingOfferIsSettled,
} from '@/features/listings/utils/listingOfferState';
import { buildListingCards } from '@/features/listings/utils/buildListingCards';
import { AppText } from '@/shared/components/AppText';
import { useCurrency } from '@/shared/hooks/useCurrency';
import { useAbortableFocusLoad } from '@/shared/hooks/useAbortableFocusLoad';
import { useLanguage } from '@/i18n/hooks/useLanguage';
import { palette, radius, spacing } from '@/theme';

type Props = CompositeScreenProps<
  BottomTabScreenProps<DashboardTabParamList, 'HomeTab'>,
  NativeStackScreenProps<RootStackParamList>
>;

/** Home feed: awaiting your confirmation, then live, then offer submitted, then the rest. */
function homeFeedSortRank(listing: ListingDto): number {
  const status = listing.rfq?.status;
  const mine = listing.rfq?.myOfferStatus;
  if (status === 'awaiting-your-confirmation' || mine === 'selected') return 0;
  if (status === 'live' || status == null) return 1;
  if (status === 'offer-submitted' || mine === 'active') return 2;
  return 3;
}

type HomeFilters = {
  type: HomeTypeFilter;
  listingKind: string[];
  city: string | null;
  dateKey: string | null;
  priceMin: string;
  priceMax: string;
  weightMin: string;
  weightMax: string;
};

const EMPTY_FILTERS: HomeFilters = {
  type: 'all',
  listingKind: [],
  city: null,
  dateKey: null,
  priceMin: '',
  priceMax: '',
  weightMin: '',
  weightMax: '',
};

export function HomeScreen({ navigation }: Props): React.ReactElement {
  const { t } = useTranslation(undefined, { i18n: appI18n });
  const catalogLabel = useLocalizedCatalogLabel();
  const { currentLanguage } = useLanguage();
  const currency = useCurrency();
  const profile = useProfileStore((state) => state.profile);
  const role = useMarketplaceRoleStore((state) => state.role);
  const hasUnread = useNotificationsStore((state) => state.items.some((item) => !item.read));
  const hasUnreadMessages = useMessagesStore((state) =>
    state.conversations.some((item) => item.unreadCount > 0),
  );
  const storedListings = useMarketListingsStore((state) => state.listings);
  const marketListings = React.useMemo(
    () =>
      storedListings
        .filter((listing) => {
          if (listingOfferIsSettled(listing)) return false;
          if (listingHasMyOffer(listing)) return true;
          return listing.rfq?.status === 'live';
        })
        .sort(
          (a, b) =>
            homeFeedSortRank(a) - homeFeedSortRank(b) || b.createdAt - a.createdAt,
        ),
    [storedListings],
  );
  const equipmentListings = React.useMemo(() => marketListings.filter(isEquipmentListing), [marketListings]);
  const serviceListings = React.useMemo(() => marketListings.filter(isServiceListing), [marketListings]);
  const goldListings = React.useMemo(() => marketListings.filter(isGoldListing), [marketListings]);
  const name = profile?.fullName?.trim() || '—';
  const firstName = name === '—' ? name : (name.split(/\s+/)[0] ?? name);
  const initial = firstName.charAt(0).toUpperCase();

  const [category, setCategory] = React.useState<ListingCategory>('equipment');
  const [query, setQuery] = React.useState('');
  const [filters, setFilters] = React.useState<HomeFilters>(EMPTY_FILTERS);
  const [draftFilters, setDraftFilters] = React.useState<HomeFilters>(EMPTY_FILTERS);
  const [filterOpen, setFilterOpen] = React.useState(false);
  const [viewMode, setViewMode] = React.useState<'list' | 'grid'>('list');
  const hasCachedData = marketListings.length > 0;

  const { loadError, refreshing, onRefresh, retry } = useAbortableFocusLoad(
    async (signal) => {
      const postedAs = oppositeMarketplaceRole(role);
      await Promise.all([
        refreshMarketListings(postedAs, { signal }),
        notificationsApi.list({ signal }).then((items) => {
          useNotificationsStore.getState().setItems(items);
        }),
      ]);
    },
    [role],
  );

  const openProfile = () => {
    navigation.navigate('Profile');
  };

  const handleSwitchRole = () => {
    confirmSwitchMarketplaceRole(t);
  };

  const handleCategoryChange = (next: ListingCategory) => {
    setCategory(next);
    setFilters(EMPTY_FILTERS);
  };

  const openFilter = () => {
    setDraftFilters(filters);
    setFilterOpen(true);
  };

  const applyFilter = () => {
    setFilters(draftFilters);
    setFilterOpen(false);
  };

  const categoryOptions =
    role === 'buyer'
      ? [
          {
            key: 'equipment' as const,
            icon: require('@/assets/images/equipment.png'),
            title: t('dashboardHome.buyerEquipment'),
            subtitle: t('dashboardHome.buyerEquipmentSubtitle'),
          },
          {
            key: 'services' as const,
            icon: require('@/assets/images/service.png'),
            title: t('dashboardHome.buyerServices'),
            subtitle: t('dashboardHome.buyerServicesSubtitle'),
          },
          {
            key: 'gold' as const,
            icon: require('@/assets/images/gold.png'),
            title: t('dashboardHome.buyerGold'),
            subtitle: t('dashboardHome.buyerGoldSubtitle'),
          },
        ]
      : [
          {
            key: 'equipment' as const,
            icon: require('@/assets/images/equipment.png'),
            title: t('dashboardHome.supplierEquipment'),
            subtitle: t('dashboardHome.supplierEquipmentSubtitle'),
          },
          {
            key: 'services' as const,
            icon: require('@/assets/images/service.png'),
            title: t('dashboardHome.supplierServices'),
            subtitle: t('dashboardHome.supplierServicesSubtitle'),
          },
        ];

  React.useEffect(() => {
    if (role === 'supplier' && category === 'gold') {
      setCategory('equipment');
      setFilters(EMPTY_FILTERS);
    }
  }, [role, category]);

  const filterOptions = React.useMemo(
    () =>
    category === 'equipment'
      ? [
          { key: 'rent' as const, label: t('equipmentListing.rent') },
          { key: 'sell' as const, label: t('equipmentListing.sell') },
        ]
      : category === 'services'
        ? [
            { key: 'onsite' as const, label: t('serviceListing.onsite') },
            { key: 'online' as const, label: t('serviceListing.online') },
          ]
        : [
            { key: '18k' as const, label: t('goldListing.karatValue', { karat: 18 }) },
            { key: '21k' as const, label: t('goldListing.karatValue', { karat: 21 }) },
            { key: '22k' as const, label: t('goldListing.karatValue', { karat: 22 }) },
            { key: '24k' as const, label: t('goldListing.karatValue', { karat: 24 }) },
          ],
    [category, t],
  );

  const kindOptions = React.useMemo(
    () =>
    category === 'equipment'
      ? [
          { key: 'excavator', label: t('equipmentListing.type.excavator') },
          { key: 'bulldozer', label: t('equipmentListing.type.bulldozer') },
          { key: 'drillRig', label: t('equipmentListing.type.drillRig') },
          { key: 'loader', label: t('equipmentListing.type.loader') },
          { key: 'crusher', label: t('equipmentListing.type.crusher') },
          { key: 'other', label: t('equipmentListing.type.other') },
        ]
      : category === 'services'
        ? [
            { key: 'consulting', label: t('serviceListing.category.consulting') },
            { key: 'drilling', label: t('serviceListing.category.drilling') },
            { key: 'assayTesting', label: t('serviceListing.category.assayTesting') },
            { key: 'transportLogistics', label: t('serviceListing.category.transportLogistics') },
            { key: 'equipmentRepair', label: t('serviceListing.category.equipmentRepair') },
            {
              key: 'environmentalPermitting',
              label: t('serviceListing.category.environmentalPermitting'),
            },
            { key: 'other', label: t('serviceListing.category.other') },
          ]
        : undefined,
    [category, t],
  );

  const cards = React.useMemo(() => {
    const selectedKindLabels = new Set(
      (kindOptions ?? [])
        .filter((option) => filters.listingKind.includes(option.key))
        .map((option) => option.label.trim().toLowerCase()),
    );
    const matchesListingKind = (label: string): boolean => {
      if (selectedKindLabels.size === 0) return true;
      return selectedKindLabels.has(label.trim().toLowerCase());
    };
    const priceMin = parseFilterNumber(filters.priceMin);
    const priceMax = parseFilterNumber(filters.priceMax);
    const weightMin = parseFilterNumber(filters.weightMin);
    const weightMax = parseFilterNumber(filters.weightMax);
    const matchesCityAndDate = (location: string, epoch: number): boolean => {
      if (filters.city) {
        const selectedCity = cityFromLocationLabel(filters.city).toLowerCase();
        const listingCity = cityFromLocationLabel(location).toLowerCase();
        if (!selectedCity || listingCity !== selectedCity) return false;
      }
      if (filters.dateKey && dayKeyFromEpoch(epoch) !== filters.dateKey) return false;
      return true;
    };
    const visibleEquipment = equipmentListings.filter((listing) => {
      if (filters.type === 'rent' || filters.type === 'sell') {
        if (listing.mode !== filters.type && listing.mode !== 'both') return false;
      }
      if (!matchesListingKind(listing.equipmentTypeLabel)) return false;
      if (!inNumericRange(equipmentListingAmount(listing), priceMin, priceMax)) return false;
      return matchesCityAndDate(listing.location, listing.createdAt);
    });
    const visibleServices = serviceListings.filter((listing) => {
      if (filters.type === 'onsite' || filters.type === 'online') {
        const flags = serviceTypeFlags(listing.serviceType);
        if (!flags[filters.type]) return false;
      }
      if (!matchesListingKind(listing.serviceCategoryLabel)) return false;
      if (!inNumericRange(serviceListingAmount(listing), priceMin, priceMax)) return false;
      return matchesCityAndDate(listing.location, listing.serviceDate ?? listing.createdAt);
    });
    const visibleGold = goldListings.filter((listing) => {
      if (!matchesGoldKarat(listing.purityLabel, filters.type)) return false;
      if (!inNumericRange(goldListingWeight(listing), weightMin, weightMax)) return false;
      if (!inNumericRange(goldListingAmount(listing), priceMin, priceMax)) return false;
      return matchesCityAndDate(listing.location, listing.auctionEndDate ?? listing.createdAt);
    });
    const needle = query.trim().toLowerCase();
    return buildListingCards({
      category,
      equipmentListings: visibleEquipment,
      serviceListings: visibleServices,
      goldListings: visibleGold,
      t,
      currencyCode: currency.code,
      catalogLabel,
      onOpen: (id, listingCategory) =>
        navigation.navigate('CompleteListingDetail', { id, category: listingCategory }),
    }).filter((card) => {
      if (!needle) return true;
      return (
        card.title.toLowerCase().includes(needle) ||
        (card.reference ?? '').toLowerCase().includes(needle) ||
        (card.subtitle ?? '').toLowerCase().includes(needle) ||
        (card.city ?? '').toLowerCase().includes(needle)
      );
    });
  }, [
    catalogLabel,
    category,
    currency.code,
    equipmentListings,
    filters,
    goldListings,
    kindOptions,
    navigation,
    query,
    serviceListings,
    t,
  ]);

  return (
    <GoldSheetScreen
      leftSlot={
        <Pressable
          onPress={openProfile}
          accessibilityRole="button"
          accessibilityLabel={firstName}
          hitSlop={8}
          style={({ pressed }) => [styles.identity, pressed && styles.identityPressed]}
        >
          <View pointerEvents="none" style={styles.avatar}>
            {profile?.avatarUrl ? (
              <Image source={{ uri: profile.avatarUrl }} style={styles.avatarImage} />
            ) : (
              <AppText weight="medium" style={styles.avatarInitial}>
                {initial}
              </AppText>
            )}
          </View>
          <View style={styles.identityText}>
            <AppText weight="medium" style={styles.name} numberOfLines={1}>
              {firstName}
            </AppText>
            <AppText style={styles.roleLabel} numberOfLines={1}>
              {role === 'buyer' ? t('dashboardHome.buyer') : t('dashboardHome.supplier')}
            </AppText>
          </View>
        </Pressable>
      }
      rightSlot={
        <View style={styles.headerActions}>
          <Pressable
            onPress={handleSwitchRole}
            accessibilityRole="button"
            accessibilityLabel={
              role === 'supplier' ? t('profile.switchToBuyer') : t('profile.switchToSupplier')
            }
            style={({ pressed }) => [styles.switchRoleButton, pressed && styles.filterPressed]}
          >
            <Ionicons name="swap-horizontal-outline" size={18} color={palette.gold} />
            <AppText weight="semibold" style={styles.switchRoleLabel} numberOfLines={1}>
              {role === 'supplier' ? t('profile.switchToBuyer') : t('profile.switchToSupplier')}
            </AppText>
          </Pressable>
          <View style={styles.headerIconPair}>
            <NotificationBellButton
              icon="chatbubble-ellipses-outline"
              hasUnread={hasUnreadMessages}
              accessibilityLabel={t('messages.title')}
              onPress={() => navigation.navigate('Messages')}
            />
            <NotificationBellButton
              hasUnread={hasUnread}
              accessibilityLabel={t('notifications.title')}
              onPress={() => navigation.navigate('Notifications')}
            />
          </View>
        </View>
      }
      headerStyle={styles.header}
      headerExtra={
        <View style={styles.headerExtra}>
          <HomeCategoryCards
            heading={
              role === 'buyer' ? t('dashboardHome.buyerHeading') : t('dashboardHome.supplierHeading')
            }
            description={
              role === 'buyer'
                ? t('dashboardHome.buyerDescription')
                : t('dashboardHome.supplierDescription')
            }
            value={category}
            options={categoryOptions}
            onChange={handleCategoryChange}
          />
        </View>
      }
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={palette.gold} />
      }
    >
      <View style={styles.searchRow}>
        <View style={styles.searchField}>
          <SearchField
            value={query}
            onChangeText={setQuery}
            placeholder={t(
              category === 'services'
                ? 'dashboardHome.searchServices'
                : category === 'gold'
                  ? 'dashboardHome.searchGold'
                  : 'dashboardHome.searchEquipment',
            )}
          />
        </View>
        <Pressable
          onPress={() => setViewMode((current) => (current === 'list' ? 'grid' : 'list'))}
          accessibilityRole="button"
          accessibilityLabel={
            viewMode === 'list' ? t('dashboardHome.viewGrid') : t('dashboardHome.viewList')
          }
          style={({ pressed }) => [styles.filterButton, pressed && styles.filterPressed]}
        >
          <Ionicons
            name={viewMode === 'list' ? 'grid-outline' : 'list-outline'}
            size={20}
            color={palette.gold}
          />
        </Pressable>
        <Pressable
          onPress={openFilter}
          accessibilityRole="button"
          accessibilityLabel={t('dashboardHome.filter')}
          style={({ pressed }) => [styles.filterButton, pressed && styles.filterPressed]}
        >
          <Ionicons name="options-outline" size={20} color={palette.gold} />
        </Pressable>
      </View>

      {loadError && !hasCachedData ? (
        <ErrorState
          title={t('common.loadFailed')}
          subtitle={t('common.loadFailedSubtitle')}
          retryLabel={t('common.retry')}
          onRetry={retry}
        />
      ) : cards.length === 0 ? (
        <EmptyState
          title={t('dashboardHome.emptyTitle')}
          subtitle={t('dashboardHome.emptySubtitle')}
        />
      ) : viewMode === 'grid' ? (
        <View style={styles.listingGrid}>
          {cards.map(({ id, ...card }) => (
            <ListingCard key={`${category}-${id}`} layout="grid" {...card} />
          ))}
        </View>
      ) : (
        cards.map(({ id, ...card }) => <ListingCard key={`${category}-${id}`} {...card} />)
      )}

      <HomeFilterSheet
        visible={filterOpen}
        onClose={() => setFilterOpen(false)}
        typeOptions={filterOptions}
        typeTitle={
          category === 'gold' ? t('dashboardHome.filterKarat') : t('dashboardHome.filterType')
        }
        kindTitle={
          category === 'equipment'
            ? t('equipmentListing.equipmentType')
            : t('serviceListing.serviceCategory')
        }
        kindPlaceholder={
          category === 'equipment'
            ? t('equipmentListing.equipmentTypePlaceholder')
            : t('serviceListing.serviceCategoryPlaceholder')
        }
        kindOptions={kindOptions}
        showWeight={category === 'gold'}
        currencyCode={currency.code}
        locale={currentLanguage}
        draftType={draftFilters.type}
        draftKind={draftFilters.listingKind}
        draftCity={draftFilters.city}
        draftDateKey={draftFilters.dateKey}
        draftPriceMin={draftFilters.priceMin}
        draftPriceMax={draftFilters.priceMax}
        draftWeightMin={draftFilters.weightMin}
        draftWeightMax={draftFilters.weightMax}
        onChangeType={(type) => setDraftFilters((current) => ({ ...current, type }))}
        onChangeKind={(listingKind) => setDraftFilters((current) => ({ ...current, listingKind }))}
        onChangeCity={(city) => setDraftFilters((current) => ({ ...current, city }))}
        onChangeDateKey={(dateKey) => setDraftFilters((current) => ({ ...current, dateKey }))}
        onChangePriceMin={(next) => setDraftFilters((current) => ({ ...current, priceMin: next }))}
        onChangePriceMax={(next) => setDraftFilters((current) => ({ ...current, priceMax: next }))}
        onChangeWeightMin={(next) =>
          setDraftFilters((current) => ({ ...current, weightMin: next }))
        }
        onChangeWeightMax={(next) =>
          setDraftFilters((current) => ({ ...current, weightMax: next }))
        }
        onReset={() => {
          setDraftFilters(EMPTY_FILTERS);
          setFilters(EMPTY_FILTERS);
        }}
        onApply={applyFilter}
      />
    </GoldSheetScreen>
  );
}

const styles = StyleSheet.create({
  identity: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    minWidth: 0,
    paddingRight: spacing.sm,
    maxWidth: '100%',
  },
  identityPressed: {
    opacity: 0.82,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: palette.pureWhite,
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  avatarInitial: {
    fontSize: 18,
    color: palette.pureWhite,
  },
  name: {
    flexShrink: 1,
    fontSize: 16,
    fontWeight: '700',
    color: palette.pureWhite,
  },
  roleLabel: {
    fontSize: 12,
    lineHeight: 16,
    color: 'rgba(255, 255, 255, 0.85)',
  },
  identityText: {
    flexShrink: 1,
    minWidth: 0,
    justifyContent: 'center',
  },
  header: {
    paddingBottom: spacing.sm,
  },
  headerExtra: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xl + spacing.sm,
    backgroundColor: palette.gold,
    gap: spacing.sm,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  headerIconPair: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: spacing.sm - 4,
  },
  switchRoleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: palette.warmWhite,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
  },
  switchRoleLabel: {
    fontSize: 13,
    color: palette.gold,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  searchField: {
    flex: 1,
    minWidth: 0,
  },
  listingGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: spacing.md,
  },
  filterButton: {
    width: 48,
    height: 48,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: palette.softGold,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.warmWhite,
  },
  filterPressed: {
    opacity: 0.88,
  },
});
