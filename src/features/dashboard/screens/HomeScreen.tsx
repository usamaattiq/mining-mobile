import React from 'react';
import { Image, Pressable, RefreshControl, StyleSheet, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useFocusEffect, type CompositeScreenProps } from '@react-navigation/native';
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
import { NotificationBellButton } from '@/features/dashboard/components/NotificationBellButton';
import { SearchField } from '@/shared/components/SearchField';
import { HomeCategoryCards } from '@/features/dashboard/components/HomeCategoryCards';
import { EmptyState } from '@/shared/components/EmptyState';
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
import { listingHasMyOffer } from '@/features/listings/utils/listingOfferState';
import { buildListingCards } from '@/features/listings/utils/buildListingCards';
import { AppText } from '@/shared/components/AppText';
import { useCurrency } from '@/shared/hooks/useCurrency';
import { useLanguage } from '@/i18n/hooks/useLanguage';
import { palette, radius, spacing } from '@/theme';

type Props = CompositeScreenProps<
  BottomTabScreenProps<DashboardTabParamList, 'HomeTab'>,
  NativeStackScreenProps<RootStackParamList>
>;

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
  const { currentLanguage } = useLanguage();
  const currency = useCurrency();
  const profile = useProfileStore((state) => state.profile);
  const role = useMarketplaceRoleStore((state) => state.role);
  const hasUnread = useNotificationsStore((state) => state.items.some((item) => !item.read));
  const hasUnreadMessages = useMessagesStore((state) =>
    state.conversations.some((item) => item.unreadCount > 0),
  );
  const marketListings = useMarketListingsStore((state) => state.listings).filter(
    (listing) => !listingHasMyOffer(listing),
  );
  const equipmentListings = marketListings.filter(isEquipmentListing);
  const serviceListings = marketListings.filter(isServiceListing);
  const goldListings = marketListings.filter(isGoldListing);
  const name = profile?.fullName?.trim() || '—';
  const firstName = name === '—' ? name : (name.split(/\s+/)[0] ?? name);
  const initial = firstName.charAt(0).toUpperCase();

  const [category, setCategory] = React.useState<ListingCategory>('equipment');
  const [query, setQuery] = React.useState('');
  const [filters, setFilters] = React.useState<HomeFilters>(EMPTY_FILTERS);
  const [draftFilters, setDraftFilters] = React.useState<HomeFilters>(EMPTY_FILTERS);
  const [filterOpen, setFilterOpen] = React.useState(false);
  const [refreshing, setRefreshing] = React.useState(false);

  useFocusEffect(
    React.useCallback(() => {
      void notificationsApi
        .list()
        .then((items) => {
          useNotificationsStore.getState().setItems(items);
        })
        .catch(() => undefined);
      void refreshMarketListings(oppositeMarketplaceRole(role)).catch(() => undefined);
    }, [role]),
  );

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    void Promise.all([
      refreshMarketListings(oppositeMarketplaceRole(role)),
      notificationsApi.list().then((items) => {
        useNotificationsStore.getState().setItems(items);
      }),
    ])
      .catch(() => undefined)
      .finally(() => setRefreshing(false));
  }, [role]);

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

  const categoryOptions = [
    {
      key: 'equipment' as const,
      icon: 'construct-outline' as const,
      title: t('requests.categoryEquipment'),
    },
    {
      key: 'services' as const,
      icon: 'briefcase-outline' as const,
      title: t('requests.categoryServices'),
    },
    ...(role === 'buyer'
      ? [
          {
            key: 'gold' as const,
            icon: 'diamond-outline' as const,
            title: t('requests.categoryGold'),
          },
        ]
      : []),
  ];

  React.useEffect(() => {
    if (role === 'supplier' && category === 'gold') {
      setCategory('equipment');
      setFilters(EMPTY_FILTERS);
    }
  }, [role, category]);

  const filterOptions =
    category === 'equipment'
      ? [
          { key: 'all' as const, label: t('dashboardHome.filterAll') },
          { key: 'rent' as const, label: t('equipmentListing.rent') },
          { key: 'sell' as const, label: t('equipmentListing.sell') },
        ]
      : category === 'services'
        ? [
            { key: 'all' as const, label: t('dashboardHome.filterAll') },
            { key: 'onsite' as const, label: t('serviceListing.onsite') },
            { key: 'online' as const, label: t('serviceListing.online') },
          ]
        : [
            { key: 'all' as const, label: t('dashboardHome.filterAll') },
            { key: '18k' as const, label: t('goldListing.karatValue', { karat: 18 }) },
            { key: '21k' as const, label: t('goldListing.karatValue', { karat: 21 }) },
            { key: '22k' as const, label: t('goldListing.karatValue', { karat: 22 }) },
            { key: '24k' as const, label: t('goldListing.karatValue', { karat: 24 }) },
          ];

  const kindOptions =
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
        : undefined;

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
      if (listing.mode !== filters.type) return false;
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

  const cards = buildListingCards({
    category,
    equipmentListings: visibleEquipment,
    serviceListings: visibleServices,
    goldListings: visibleGold,
    t,
    currencyCode: currency.code,
    locale: currentLanguage,
    onOpen: (id, listingCategory) =>
      navigation.navigate('CompleteListingDetail', { id, category: listingCategory }),
  }).filter((card) => {
    const needle = query.trim().toLowerCase();
    if (!needle) return true;
    return (
      card.title.toLowerCase().includes(needle) ||
      (card.subtitle ?? '').toLowerCase().includes(needle) ||
      (card.city ?? '').toLowerCase().includes(needle)
    );
  });

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
            <AppText weight="semibold" style={styles.roleHint} numberOfLines={1}>
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
            placeholder={t('dashboardHome.searchPlaceholder')}
          />
        </View>
        <Pressable
          onPress={openFilter}
          accessibilityRole="button"
          accessibilityLabel={t('dashboardHome.filter')}
          style={({ pressed }) => [styles.filterButton, pressed && styles.filterPressed]}
        >
          <Ionicons name="options-outline" size={20} color={palette.gold} />
        </Pressable>
      </View>

      {cards.length === 0 ? (
        <EmptyState title={t('requests.emptyTitle')} subtitle={t('requests.emptySubtitle')} />
      ) : (
        cards.map(({ id, ...card }) => <ListingCard key={id} {...card} />)
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
  identityText: {
    flexShrink: 1,
    minWidth: 0,
    justifyContent: 'center',
  },
  roleHint: {
    marginTop: 1,
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.82)',
  },
  header: {
    paddingBottom: spacing.sm,
  },
  headerExtra: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xl + spacing.sm,
    backgroundColor: palette.gold,
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
    backgroundColor: palette.pureWhite,
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
