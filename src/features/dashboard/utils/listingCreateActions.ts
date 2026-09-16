import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { TranslateFn } from '@/shared/types/translate.types';
import type { MarketplaceRole, RootStackParamList } from '@/navigation/types';
import type { HomeActionCardProps } from '@/features/dashboard/types/homeActionCard.types';

/** Buyers can create equipment/service only; gold auctions are supplier-only. */
export function listingCreateActions(
  t: TranslateFn,
  navigate: NativeStackNavigationProp<RootStackParamList>['navigate'],
  role: MarketplaceRole,
): HomeActionCardProps[] {
  const actions: HomeActionCardProps[] = [
    {
      icon: 'construct-outline',
      title: t('dashboardHome.listEquipment'),
      subtitle: t('dashboardHome.listEquipmentSubtitle'),
      onPress: () => navigate('EquipmentListingMode'),
    },
    {
      icon: 'briefcase-outline',
      title: t('dashboardHome.listService'),
      subtitle: t('dashboardHome.listServiceSubtitle'),
      onPress: () => navigate('ServiceListingMode'),
    },
  ];

  if (role === 'supplier') {
    actions.push({
      icon: 'hammer-outline',
      title: t('dashboardHome.auctionGold'),
      subtitle: t('dashboardHome.auctionGoldSubtitle'),
      onPress: () => navigate('GoldListingForm'),
    });
  }

  return actions;
}
