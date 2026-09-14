import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { TFunction } from 'i18next';
import type { RootStackParamList } from '@/navigation/types';
import type { HomeActionCardProps } from '@/features/dashboard/types/homeActionCard.types';

export function listingCreateActions(
  t: TFunction,
  navigate: NativeStackNavigationProp<RootStackParamList>['navigate'],
): HomeActionCardProps[] {
  return [
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
    {
      icon: 'hammer-outline',
      title: t('dashboardHome.auctionGold'),
      subtitle: t('dashboardHome.auctionGoldSubtitle'),
      onPress: () => navigate('GoldListingForm'),
    },
  ];
}
