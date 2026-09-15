import React from 'react';
import { Image, Pressable, StyleSheet, View } from 'react-native';
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
import { SegmentedSwitcher } from '@/shared/components/SegmentedSwitcher';
import { SearchField } from '@/shared/components/SearchField';
import { AppBottomSheet } from '@/shared/components/AppBottomSheet';
import { EmptyState } from '@/shared/components/EmptyState';
import { Button } from '@/shared/components/Button';
import { ListingCard } from '@/features/listings/components/ListingCard';
import {
  isEquipmentListing,
  isGoldListing,
  isServiceListing,
} from '@/features/listings/api/listingsApi';
import { useNotificationsStore } from '@/store/notificationsStore';
import { useProfileStore } from '@/store/profileStore';
import { useMarketListingsStore } from '@/store/marketListingsStore';
import {
  confirmSwitchMarketplaceRole,
  oppositeMarketplaceRole,
  useMarketplaceRoleStore,
} from '@/store/marketplaceRoleStore';
import { notificationsApi } from '@/features/dashboard/api/notificationsApi';
import { refreshMarketListings } from '@/features/listings/utils/refreshListings';
import { buildListingCards } from '@/features/listings/utils/buildListingCards';
import { AppText } from '@/shared/components/AppText';
import { useCurrency } from '@/shared/hooks/useCurrency';
import { useLanguage } from '@/i18n/hooks/useLanguage';
import { palette, radius, spacing } from '@/theme';

type Props = CompositeScreenProps<
  BottomTabScreenProps<DashboardTabParamList, 'HomeTab'>,
  NativeStackScreenProps<RootStackParamList>
>;

type HomeFilter = 'all' | 'rent' | 'sell' | 'onsite' | 'online';

export function HomeScreen({ navigation }: Props): React.ReactElement {
  const { t } = useTranslation(undefined, { i18n: appI18n });
  const { currentLanguage } = useLanguage();
  const currency = useCurrency();
  const profile = useProfileStore((state) => state.profile);
  const role = useMarketplaceRoleStore((state) => state.role);
  const hasUnread = useNotificationsStore((state) => state.items.some((item) => !item.read));
  const marketListings = useMarketListingsStore((state) => state.listings);
  const equipmentListings = marketListings.filter(isEquipmentListing);
  const serviceListings = marketListings.filter(isServiceListing);
  const goldListings = marketListings.filter(isGoldListing);
  const name = profile?.fullName?.trim() || '—';
  const firstName = name === '—' ? name : (name.split(/\s+/)[0] ?? name);
  const initial = firstName.charAt(0).toUpperCase();

  const [category, setCategory] = React.useState<ListingCategory>('equipment');
  const [query, setQuery] = React.useState('');
  const [filter, setFilter] = React.useState<HomeFilter>('all');
  const [draftFilter, setDraftFilter] = React.useState<HomeFilter>('all');
  const [filterOpen, setFilterOpen] = React.useState(false);

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

  const openProfile = () => {
    navigation.navigate('Profile');
  };

  const handleSwitchRole = () => {
    confirmSwitchMarketplaceRole(t);
  };

  const handleCategoryChange = (next: ListingCategory) => {
    setCategory(next);
    setFilter('all');
  };

  const openFilter = () => {
    setDraftFilter(filter);
    setFilterOpen(true);
  };

  const applyFilter = () => {
    setFilter(draftFilter);
    setFilterOpen(false);
  };

  const categoryOptions = [
    { key: 'equipment' as const, label: t('requests.categoryEquipment') },
    { key: 'services' as const, label: t('requests.categoryServices') },
    { key: 'gold' as const, label: t('requests.categoryGold') },
  ];

  const filterOptions: { key: HomeFilter; label: string }[] =
    category === 'equipment'
      ? [
          { key: 'all', label: t('dashboardHome.filterAll') },
          { key: 'rent', label: t('equipmentListing.rent') },
          { key: 'sell', label: t('equipmentListing.sell') },
        ]
      : category === 'services'
        ? [
            { key: 'all', label: t('dashboardHome.filterAll') },
            { key: 'onsite', label: t('serviceListing.onsite') },
            { key: 'online', label: t('serviceListing.online') },
          ]
        : [{ key: 'all', label: t('dashboardHome.filterAll') }];

  const visibleEquipment =
    filter === 'rent' || filter === 'sell'
      ? equipmentListings.filter((listing) => listing.mode === filter)
      : equipmentListings;
  const visibleServices =
    filter === 'onsite' || filter === 'online'
      ? serviceListings.filter((listing) => listing.serviceType === filter)
      : serviceListings;

  const cards = buildListingCards({
    category,
    equipmentListings: visibleEquipment,
    serviceListings: visibleServices,
    goldListings,
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
          <AppText weight="medium" style={styles.name} numberOfLines={1}>
            {firstName}
          </AppText>
        </Pressable>
      }
      rightSlot={
        <NotificationBellButton
          hasUnread={hasUnread}
          accessibilityLabel={t('notifications.title')}
          onPress={() => navigation.navigate('Notifications')}
        />
      }
      headerStyle={styles.header}
      headerExtra={
        <View style={styles.headerExtra}>
          <Pressable
            onPress={handleSwitchRole}
            accessibilityRole="button"
            accessibilityLabel={
              role === 'supplier' ? t('profile.switchToBuyer') : t('profile.switchToSupplier')
            }
            style={({ pressed }) => [styles.switchRoleButton, pressed && styles.filterPressed]}
          >
            <Ionicons name="swap-horizontal-outline" size={18} color={palette.gold} />
            <AppText weight="semibold" style={styles.switchRoleLabel}>
              {role === 'supplier' ? t('profile.switchToBuyer') : t('profile.switchToSupplier')}
            </AppText>
          </Pressable>
          <SegmentedSwitcher
            value={category}
            onChange={handleCategoryChange}
            options={categoryOptions}
          />
        </View>
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

      <AppBottomSheet visible={filterOpen} onClose={() => setFilterOpen(false)} heightRatio={0.42}>
        <AppText weight="bold" style={styles.sheetTitle}>
          {t('dashboardHome.filterTitle')}
        </AppText>
        {filterOptions.map((option) => {
          const selected = draftFilter === option.key;
          return (
            <Pressable
              key={option.key}
              onPress={() => setDraftFilter(option.key)}
              style={({ pressed }) => [styles.filterOption, pressed && styles.filterPressed]}
            >
              <AppText weight={selected ? 'semibold' : 'medium'} style={styles.filterOptionLabel}>
                {option.label}
              </AppText>
              {selected ? <Ionicons name="checkmark" size={18} color={palette.gold} /> : null}
            </Pressable>
          );
        })}
        <Button label={t('dashboardHome.apply')} onPress={applyFilter} style={styles.applyButton} />
      </AppBottomSheet>
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
  header: {
    paddingBottom: spacing.sm,
  },
  headerExtra: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
    gap: spacing.sm,
    backgroundColor: palette.gold,
  },
  switchRoleButton: {
    alignSelf: 'flex-end',
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
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: palette.softGold,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.warmWhite,
  },
  filterPressed: {
    opacity: 0.88,
  },
  sheetTitle: {
    fontSize: 16,
    color: palette.charcoal,
    textAlign: 'center',
    marginBottom: spacing.sm,
    paddingVertical: spacing.sm,
  },
  filterOption: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.sm,
    borderRadius: radius.md,
  },
  filterOptionLabel: {
    fontSize: 15,
    color: palette.charcoal,
  },
  applyButton: {
    marginTop: spacing.md,
  },
});
