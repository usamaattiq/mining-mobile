import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { i18n as appI18n } from '@/i18n';
import { AppTopBar } from '@/shared/components/AppTopBar';
import { CurvedSheetScrollView } from '@/features/dashboard/components/CurvedSheetScrollView';
import { HomeActionCard } from '@/features/dashboard/components/HomeActionCard';
import { palette, radius, spacing } from '@/theme';

export function HomeScreen(): React.ReactElement {
  const { t } = useTranslation(undefined, { i18n: appI18n });

  const actions = [
    {
      icon: 'construct-outline' as const,
      title: t('dashboardHome.listEquipment'),
      subtitle: t('dashboardHome.listEquipmentSubtitle'),
      onPress: () => {},
    },
    {
      icon: 'briefcase-outline' as const,
      title: t('dashboardHome.listService'),
      subtitle: t('dashboardHome.listServiceSubtitle'),
      onPress: () => {},
    },
    {
      icon: 'hammer-outline' as const,
      title: t('dashboardHome.auctionGold'),
      subtitle: t('dashboardHome.auctionGoldSubtitle'),
      onPress: () => {},
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
            accessibilityLabel="Notifications"
            hitSlop={12}
            style={({ pressed }) => [styles.notificationButton, pressed && styles.pressed]}
          >
            <Ionicons name="notifications-outline" size={20} color={palette.pureWhite} />
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
  pressed: {
    opacity: 0.75,
  },
  header: {
    paddingBottom: spacing.xl,
  },
});
