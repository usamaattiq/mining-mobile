import React from 'react';
import { StyleSheet, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { i18n as appI18n } from '@/i18n';
import type { RootStackParamList } from '@/navigation/types';
import { AppTopBar } from '@/shared/components/AppTopBar';
import { CurvedSheetScrollView } from '@/features/dashboard/components/CurvedSheetScrollView';
import { HomeActionCard } from '@/features/dashboard/components/HomeActionCard';
import { palette, spacing } from '@/theme';

type Props = NativeStackScreenProps<RootStackParamList, 'QuickCreate'>;

/** Full-screen listing-type picker opened from the tab bar's "+" button. */
export function QuickCreateScreen({ navigation }: Props): React.ReactElement {
  const { t } = useTranslation(undefined, { i18n: appI18n });

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
      <StatusBar style="light" />

      <AppTopBar
        left="back"
        variant="gold"
        title={t('dashboardHome.quickCreateTitle')}
        onBackPress={navigation.goBack}
        style={styles.header}
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
  header: {
    paddingBottom: spacing.xl,
  },
});
