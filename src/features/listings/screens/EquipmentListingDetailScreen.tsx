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
import { EquipmentImageCarousel } from '@/features/listings/components/EquipmentImageCarousel';
import { EquipmentImageViewerModal } from '@/features/listings/components/EquipmentImageViewerModal';
import { EquipmentListingSummaryCard } from '@/features/listings/components/EquipmentListingSummaryCard';
import { DeliveryAvailableBanner } from '@/features/listings/components/DeliveryAvailableBanner';
import { useListingsStore } from '@/store/listingsStore';
import { palette, spacing } from '@/theme';

type Props = NativeStackScreenProps<RootStackParamList, 'EquipmentListingDetail'>;

export function EquipmentListingDetailScreen({ navigation, route }: Props): React.ReactElement {
  const { t } = useTranslation(undefined, { i18n: appI18n });
  const listing = useListingsStore((state) =>
    state.listings.find((item) => item.id === route.params.id),
  );
  const [viewerIndex, setViewerIndex] = React.useState<number | null>(null);

  if (!listing) {
    return (
      <View style={styles.root}>
        <StatusBar style="light" />
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
          { label: t('equipmentListing.weeklyRental'), value: listing.weeklyRental },
          { label: t('equipmentListing.monthlyRental'), value: listing.monthlyRental },
        ]
      : [{ label: t('equipmentListing.salePrice'), value: listing.salePrice }]),
    { label: t('equipmentListing.units'), value: String(listing.units) },
  ].filter((row) => (row.value ?? '').trim().length > 0);

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
        <EquipmentImageCarousel
          media={listing.media}
          onPressImage={setViewerIndex}
          style={styles.carousel}
        />

        <EquipmentListingSummaryCard detailRows={detailRows} media={listing.media} hideMedia />

        {listing.deliveryAvailable ? <DeliveryAvailableBanner /> : null}
      </CurvedSheetScrollView>

      <EquipmentImageViewerModal
        visible={viewerIndex !== null}
        media={listing.media}
        initialIndex={viewerIndex ?? 0}
        onClose={() => setViewerIndex(null)}
      />
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
  carousel: {
    marginTop: -spacing.md,
    marginHorizontal: -spacing.sm,
    borderRadius: spacing.lg,
  },
  notFound: {
    fontSize: 14,
    color: palette.muted,
    textAlign: 'center',
    marginTop: spacing.xxl,
  },
});
