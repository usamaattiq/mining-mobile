import React from 'react';
import { StyleSheet, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { CompositeScreenProps } from '@react-navigation/native';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { useTranslation } from 'react-i18next';
import { i18n as appI18n } from '@/i18n';
import type { DashboardTabParamList, RootStackParamList } from '@/navigation/types';
import { AppTopBar } from '@/shared/components/AppTopBar';
import { CurvedSheetScrollView } from '@/features/dashboard/components/CurvedSheetScrollView';
import { AppText } from '@/shared/components/AppText';
import { EquipmentListingCard } from '@/features/listings/components/EquipmentListingCard';
import { useListingsStore } from '@/store/listingsStore';
import { palette, spacing } from '@/theme';

type Props = CompositeScreenProps<
  BottomTabScreenProps<DashboardTabParamList, 'Requests'>,
  NativeStackScreenProps<RootStackParamList>
>;

export function RequestsScreen({ navigation }: Props): React.ReactElement {
  const { t } = useTranslation(undefined, { i18n: appI18n });
  const listings = useListingsStore((state) => state.listings);

  return (
    <View style={styles.root}>
      <AppTopBar
        variant="gold"
        title={t('requests.title')}
        titleAlign="left"
        titleSize="lg"
        style={styles.header}
      />
      <CurvedSheetScrollView>
        {listings.length === 0 ? (
          <View style={styles.empty}>
            <AppText weight="semibold" style={styles.emptyTitle}>
              {t('requests.emptyTitle')}
            </AppText>
            <AppText style={styles.emptySubtitle}>{t('requests.emptySubtitle')}</AppText>
          </View>
        ) : (
          listings.map((listing) => (
            <EquipmentListingCard
              key={listing.id}
              listing={listing}
              onPress={() => navigation.navigate('EquipmentListingDetail', { id: listing.id })}
            />
          ))
        )}
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
  empty: {
    paddingVertical: spacing.xxl,
    alignItems: 'center',
    gap: spacing.xs,
  },
  emptyTitle: {
    fontSize: 15,
    color: palette.charcoal,
  },
  emptySubtitle: {
    fontSize: 13,
    color: palette.muted,
    textAlign: 'center',
  },
});
