import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
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
import { useCurrency } from '@/shared/hooks/useCurrency';
import { palette, radius, spacing } from '@/theme';

type Props = NativeStackScreenProps<RootStackParamList, 'EquipmentListingDetail'>;

export function EquipmentListingDetailScreen({ navigation, route }: Props): React.ReactElement {
  const { t } = useTranslation(undefined, { i18n: appI18n });
  const currency = useCurrency();
  const listing = useListingsStore((state) =>
    state.listings.find((item) => item.id === route.params.id),
  );
  const [viewerIndex, setViewerIndex] = React.useState<number | null>(null);
  const [selectedDuration, setSelectedDuration] = React.useState<
    'hourly' | 'weekly' | 'monthly' | null
  >(null);

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
    { label: t('equipmentListing.units'), value: String(listing.units) },
    { label: t('equipmentListing.location'), value: listing.location },
  ].filter((row) => (row.value ?? '').trim().length > 0);

  const durationOptions = isRent
    ? (
        [
          listing.hourlyRental
            ? {
                key: 'hourly' as const,
                amount: listing.hourlyRental,
                unit: t('equipmentListing.hourlyUnit'),
                label: t('equipmentListing.hourlyBadge'),
              }
            : null,
          listing.weeklyRental
            ? {
                key: 'weekly' as const,
                amount: listing.weeklyRental,
                unit: t('equipmentListing.weeklyUnit'),
                label: t('equipmentListing.weeklyBadge'),
              }
            : null,
          listing.monthlyRental
            ? {
                key: 'monthly' as const,
                amount: listing.monthlyRental,
                unit: t('equipmentListing.monthlyUnit'),
                label: t('equipmentListing.monthlyBadge'),
              }
            : null,
        ] as const
      ).filter((option): option is NonNullable<typeof option> => option !== null)
    : [];

  const activeDuration =
    durationOptions.find((option) => option.key === selectedDuration) ?? durationOptions[0];

  const price = isRent
    ? activeDuration
      ? { amount: activeDuration.amount, unit: activeDuration.unit }
      : null
    : listing.salePrice
      ? { amount: listing.salePrice, unit: '' }
      : null;

  const deliverySubtitle = listing.deliveryAvailable
    ? listing.deliveryType === 'free'
      ? t('equipmentListing.deliveryFree')
      : `${t('equipmentListing.deliveryPerKm')} · ${currency.symbol} ${listing.deliveryPricePerKm}`
    : undefined;

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

        {price ? (
          <View style={styles.priceRow}>
            <View style={styles.priceValueRow}>
              <AppText weight="bold" style={styles.priceAmount}>
                {currency.symbol} {price.amount}
              </AppText>
              {price.unit ? <AppText style={styles.priceUnit}>{price.unit}</AppText> : null}
            </View>

            {durationOptions.length > 1 ? (
              <View style={styles.durationRow}>
                {durationOptions.map((option) => {
                  const selected = option.key === activeDuration?.key;
                  return (
                    <Pressable
                      key={option.key}
                      onPress={() => setSelectedDuration(option.key)}
                      style={[styles.durationButton, selected && styles.durationButtonSelected]}
                    >
                      <AppText
                        weight="semibold"
                        style={[styles.durationText, selected && styles.durationTextSelected]}
                      >
                        {option.label}
                      </AppText>
                    </Pressable>
                  );
                })}
              </View>
            ) : null}
          </View>
        ) : null}

        <EquipmentListingSummaryCard detailRows={detailRows} media={listing.media} hideMedia />

        {listing.deliveryAvailable ? <DeliveryAvailableBanner subtitle={deliverySubtitle} /> : null}
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
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  priceValueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: spacing.xs,
  },
  priceAmount: {
    fontSize: 28,
    color: palette.charcoal,
  },
  priceUnit: {
    fontSize: 15,
    color: palette.muted,
  },
  durationRow: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  durationButton: {
    borderWidth: 1,
    borderColor: palette.softGold,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
  },
  durationButtonSelected: {
    backgroundColor: palette.gold,
    borderColor: palette.gold,
  },
  durationText: {
    fontSize: 12,
    color: palette.charcoal,
  },
  durationTextSelected: {
    color: palette.pureWhite,
  },
  notFound: {
    fontSize: 14,
    color: palette.muted,
    textAlign: 'center',
    marginTop: spacing.xxl,
  },
});
