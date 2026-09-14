import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { CompositeScreenProps } from '@react-navigation/native';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { useTranslation } from 'react-i18next';
import { i18n as appI18n } from '@/i18n';
import type { DashboardTabParamList, RootStackParamList } from '@/navigation/types';
import { AppTopBar } from '@/shared/components/AppTopBar';
import { CurvedSheetScrollView } from '@/features/dashboard/components/CurvedSheetScrollView';
import { HomeActionCard } from '@/features/dashboard/components/HomeActionCard';
import { useNotificationsStore } from '@/store/notificationsStore';
import { palette, radius, spacing } from '@/theme';

type Props = CompositeScreenProps<
  BottomTabScreenProps<DashboardTabParamList, 'HomeTab'>,
  NativeStackScreenProps<RootStackParamList>
>;

export function HomeScreen({ navigation }: Props): React.ReactElement {
  const { t } = useTranslation(undefined, { i18n: appI18n });
  const hasUnread = useNotificationsStore((state) => state.items.some((item) => !item.read));

  const actions = [
    {
      icon: 'construct-outline' as const,
      title: t('dashboardHome.listEquipment'),
      subtitle: t('dashboardHome.listEquipmentSubtitle'),
      onPress: () => navigation.navigate('EquipmentListingMode'),
    },
    {
      icon: 'briefcase-outline' as const,
      title: t('dashboardHome.listService'),
      subtitle: t('dashboardHome.listServiceSubtitle'),
      onPress: () => navigation.navigate('ServiceListingMode'),
    },
    {
      icon: 'hammer-outline' as const,
      title: t('dashboardHome.auctionGold'),
      subtitle: t('dashboardHome.auctionGoldSubtitle'),
      onPress: () => navigation.navigate('GoldListingForm'),
    },
  ];

  return (
    <View style={styles.root}>
      <AppTopBar
        variant="gold"
        title={t('dashboardHome.title')}
        titleAlign="left"
        titleSize="lg"
        style={styles.header}
        rightSlot={
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('notifications.title')}
            hitSlop={12}
            onPress={() => navigation.navigate('Notifications')}
            style={({ pressed }) => [styles.notificationButton, pressed && styles.pressed]}
          >
            <Ionicons name="notifications-outline" size={20} color={palette.pureWhite} />
            {hasUnread ? <View style={styles.unreadDot} /> : null}
          </Pressable>
        }
      />
      <CurvedSheetScrollView>
        {actions.map((action) => (
          <HomeActionCard key={action.title} {...action} />
        ))}
      </CurvedSheetScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: palette.gold,
  },
  notificationButton: {
    width: 36,
    height: 36,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
  },
  unreadDot: {
    position: 'absolute',
    top: 7,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: palette.pureWhite,
    borderWidth: 1,
    borderColor: palette.gold,
  },
  pressed: {
    opacity: 0.75,
  },
  header: {
    paddingBottom: spacing.xl,
  },
});
