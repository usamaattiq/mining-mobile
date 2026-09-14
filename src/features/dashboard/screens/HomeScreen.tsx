import React from 'react';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useFocusEffect, type CompositeScreenProps } from '@react-navigation/native';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { useTranslation } from 'react-i18next';
import { i18n as appI18n } from '@/i18n';
import type { DashboardTabParamList, RootStackParamList } from '@/navigation/types';
import { GoldSheetScreen } from '@/features/dashboard/components/GoldSheetScreen';
import { HomeActionCard } from '@/features/dashboard/components/HomeActionCard';
import { NotificationBellButton } from '@/features/dashboard/components/NotificationBellButton';
import { listingCreateActions } from '@/features/dashboard/utils/listingCreateActions';
import { useNotificationsStore } from '@/store/notificationsStore';
import { notificationsApi } from '@/features/dashboard/api/notificationsApi';

type Props = CompositeScreenProps<
  BottomTabScreenProps<DashboardTabParamList, 'HomeTab'>,
  NativeStackScreenProps<RootStackParamList>
>;

export function HomeScreen({ navigation }: Props): React.ReactElement {
  const { t } = useTranslation(undefined, { i18n: appI18n });
  const hasUnread = useNotificationsStore((state) => state.items.some((item) => !item.read));
  const actions = listingCreateActions(t, navigation.navigate);

  useFocusEffect(
    React.useCallback(() => {
      void notificationsApi.list().then((items) => {
        useNotificationsStore.getState().setItems(items);
      });
    }, []),
  );

  return (
    <GoldSheetScreen
      title={t('dashboardHome.title')}
      titleAlign="left"
      titleSize="lg"
      rightSlot={
        <NotificationBellButton
          hasUnread={hasUnread}
          accessibilityLabel={t('notifications.title')}
          onPress={() => navigation.navigate('Notifications')}
        />
      }
    >
      {actions.map((action) => (
        <HomeActionCard key={action.title} {...action} />
      ))}
    </GoldSheetScreen>
  );
}
