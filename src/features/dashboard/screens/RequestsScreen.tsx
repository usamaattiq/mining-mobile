import React from 'react';
import { StyleSheet, View } from 'react-native';
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
import type { ListingCardProps } from '@/features/listings/types/listingCard.types';
import { useListingsStore } from '@/store/listingsStore';
import { useServiceListingsStore } from '@/store/serviceListingsStore';
import { useGoldListingsStore } from '@/store/goldListingsStore';
import { refreshListings } from '@/features/listings/utils/refreshListings';
import { useCurrency } from '@/shared/hooks/useCurrency';
import { formatAmountWithCommas } from '@/shared/utils/formatAmount';
import { palette, spacing } from '@/theme';

type Props = CompositeScreenProps<
  BottomTabScreenProps<DashboardTabParamList, 'Requests'>,
  NativeStackScreenProps<RootStackParamList>
>;

export function RequestsScreen({ navigation }: Props): React.ReactElement {
  const { t } = useTranslation(undefined, { i18n: appI18n });
  const currency = useCurrency();
  const equipmentListings = useListingsStore((state) => state.listings);
  const serviceListings = useServiceListingsStore((state) => state.listings);
  const goldListings = useGoldListingsStore((state) => state.listings);
  const [category, setCategory] = React.useState<ListingCategory>('equipment');

  useFocusEffect(
    React.useCallback(() => {
      void refreshListings();
    }, []),
  );

  const categoryOptions = [
    { key: 'equipment' as const, label: t('requests.categoryEquipment') },
    { key: 'services' as const, label: t('requests.categoryServices') },
    { key: 'gold' as const, label: t('requests.categoryGold') },
  ];

  const priceText = (amount: string) =>
    amount ? `${currency.code} ${formatAmountWithCommas(amount)}` : undefined;

  const cards: (ListingCardProps & { id: string })[] =
    category === 'equipment'
      ? equipmentListings.map((listing) => {
          const isRent = listing.mode === 'rent';
          const durationBadges = isRent
            ? [
                listing.hourlyRental ? t('equipmentListing.hourlyBadge') : null,
                listing.weeklyRental ? t('equipmentListing.weeklyBadge') : null,
                listing.monthlyRental ? t('equipmentListing.monthlyBadge') : null,
              ].filter((label): label is string => Boolean(label))
            : [t('equipmentListing.saleBadge')];

          return {
            id: listing.id,
            title: listing.title,
            thumbnail: listing.media.find((item) => item.kind === 'photo')?.uri,
            placeholderIcon: 'construct-outline',
            subtitle: `${listing.equipmentTypeLabel} · ${t('equipmentListing.unitsCount', { count: listing.units })}`,
            subtitleIcon: 'construct-outline',
            primaryBadge: {
              key: 'mode',
              label: t(isRent ? 'equipmentListing.rent' : 'equipmentListing.sell'),
            },
            secondaryBadges: durationBadges.map((label) => ({ key: label, label })),
            cornerBadge: listing.deliveryAvailable
              ? { key: 'delivery', label: t('equipmentListing.deliveryBadge'), icon: 'car-outline' }
              : undefined,
            createdAt: listing.createdAt,
            onPress: () =>
              navigation.navigate('CompleteListingDetail', {
                id: listing.id,
                category: 'equipment',
              }),
          };
        })
      : category === 'services'
        ? serviceListings.map((listing) => ({
            id: listing.id,
            title: listing.title,
            thumbnail: listing.media.find((item) => item.kind === 'photo')?.uri,
            placeholderIcon: 'briefcase-outline',
            subtitle: listing.serviceCategoryLabel,
            subtitleIcon: 'briefcase-outline',
            primaryBadge: {
              key: 'serviceType',
              label: t(
                listing.serviceType === 'onsite'
                  ? 'serviceListing.onsite'
                  : 'serviceListing.online',
              ),
              icon: listing.serviceType === 'onsite' ? 'location-outline' : 'globe-outline',
            },
            priceText: priceText(listing.price),
            onPress: () =>
              navigation.navigate('CompleteListingDetail', {
                id: listing.id,
                category: 'services',
              }),
          }))
        : goldListings.map((listing) => ({
            id: listing.id,
            title: listing.title,
            thumbnail: listing.media.find((item) => item.kind === 'photo')?.uri,
            placeholderIcon: 'diamond-outline',
            secondaryBadges: [
              listing.purityLabel ? { key: 'purity', label: listing.purityLabel } : null,
              listing.weight
                ? { key: 'weight', label: t('goldListing.weightValue', { weight: listing.weight }) }
                : null,
            ].filter((badge): badge is { key: string; label: string } => Boolean(badge)),
            priceText: priceText(listing.price),
            onPress: () =>
              navigation.navigate('CompleteListingDetail', { id: listing.id, category: 'gold' }),
          }));

  return (
    <GoldSheetScreen
      title={t('requests.title')}
      titleAlign="left"
      titleSize="lg"
      headerStyle={styles.header}
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
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
    backgroundColor: palette.gold,
  },
});
