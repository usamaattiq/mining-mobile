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
  const isBuyer = role === 'buyer';
  const actions: HomeActionCardProps[] = [
    {
      icon: 'construct-outline',
      iconImage: require('@/assets/images/equipment.png'),
      title: t(isBuyer ? 'dashboardHome.requestEquipment' : 'dashboardHome.listEquipment'),
      subtitle: t(
        isBuyer ? 'dashboardHome.requestEquipmentSubtitle' : 'dashboardHome.listEquipmentSubtitle',
      ),
      onPress: () => navigate('EquipmentListingForm'),
      image: require('@/assets/images/request-equipment.jpg'),
    },
    {
      icon: 'briefcase-outline',
      iconImage: require('@/assets/images/service.png'),
      title: t(isBuyer ? 'dashboardHome.requestService' : 'dashboardHome.listService'),
      subtitle: t(
        isBuyer ? 'dashboardHome.requestServiceSubtitle' : 'dashboardHome.listServiceSubtitle',
      ),
      onPress: () => navigate('ServiceListingForm'),
      image: require('@/assets/images/request-service.jpg'),
    },
  ];

  if (role === 'supplier') {
    actions.push({
      icon: 'hammer-outline',
      iconImage: require('@/assets/images/gold.png'),
      title: t('dashboardHome.auctionGold'),
      subtitle: t('dashboardHome.auctionGoldSubtitle'),
      onPress: () => navigate('GoldListingForm'),
      image: require('@/assets/images/request-gold.jpg'),
    });
  }

  return actions;
}
