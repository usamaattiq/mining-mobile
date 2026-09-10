import React from 'react';
import { StyleSheet, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { i18n as appI18n } from '@/i18n';
import type { RootStackParamList } from '@/navigation/types';
import { AppTopBar } from '@/shared/components/AppTopBar';
import { AppText } from '@/shared/components/AppText';
import { CurvedSheetScrollView } from '@/features/dashboard/components/CurvedSheetScrollView';
import { EquipmentListingSummaryCard } from '@/features/listings/components/EquipmentListingSummaryCard';
import { ToggleRow } from '@/shared/components/ToggleRow';
import { useListingsStore } from '@/store/listingsStore';
import { palette, spacing } from '@/theme';

type Props = NativeStackScreenProps<RootStackParamList, 'EquipmentListingDetail'>;

export function EquipmentListingDetailScreen({ navigation, route }: Props): React.ReactElement {
  const { t } = useTranslation(undefined, { i18n: appI18n });
  const listing = useListingsStore((state) =>
    state.listings.find((item) => item.id === route.params.id),
  );

  if (!listing) {
    return (
      <View style={styles.root}>
        <AppTopBar
          left="back"
          variant="gold"
          onBackPress={navigation.goBack}
          style={styles.header}
        />
        <CurvedSheetScrollView>
          <AppText style={styles.notFound}>{t('requests.notFound')}</AppText>
        </CurvedSheetScrollView>
      </View>
    );
  }

  const isRent = listing.mode === 'rent';

  const detailRows = [
    { label: t('equipmentListing.equipmentType'), value: listing.equipmentTypeLabel },
    { label: t('equipmentListing.title'), value: listing.title },
    { label: t('equipmentListing.description'), value: listing.description },
    ...(isRent
      ? [
          { label: t('equipmentListing.hourlyRental'), value: listing.hourlyRental },
          { label: t('equipmentListing.monthlyRental'), value: listing.monthlyRental },
          { label: t('equipmentListing.yearlyRental'), value: listing.yearlyRental },
        ]
      : [{ label: t('equipmentListing.salePrice'), value: listing.salePrice }]),
    { label: t('equipmentListing.units'), value: String(listing.units) },
  ].filter((row) => row.value.trim().length > 0);

  return (
    <View style={styles.root}>
      <StatusBar style="light" />

      <AppTopBar
        left="back"
        variant="gold"
        title={listing.title}
        onBackPress={navigation.goBack}
        style={styles.header}
      />

      <CurvedSheetScrollView>
        <EquipmentListingSummaryCard detailRows={detailRows} media={listing.media} />

        <ToggleRow
          title={t('equipmentListing.deliveryAvailable')}
          subtitle={t('equipmentListing.deliveryReadOnlySubtitle')}
          enabled={listing.deliveryAvailable}
          onToggle={() => {}}
          disabled
        />
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
  notFound: {
    fontSize: 14,
    color: palette.muted,
    textAlign: 'center',
    marginTop: spacing.xxl,
  },
});
