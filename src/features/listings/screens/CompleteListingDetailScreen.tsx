import React from 'react';
import { KeyboardAvoidingView, Linking, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { i18n as appI18n } from '@/i18n';
import { useLanguage } from '@/i18n/hooks/useLanguage';
import type { RootStackParamList } from '@/navigation/types';
import { AppText } from '@/shared/components/AppText';
import { SelectField } from '@/shared/components/SelectField';
import { EquipmentImageCarousel } from '@/features/listings/components/EquipmentImageCarousel';
import { EquipmentImageViewerModal } from '@/features/listings/components/EquipmentImageViewerModal';
import { EquipmentListingSummaryCard } from '@/features/listings/components/EquipmentListingSummaryCard';
import { EquipmentDescriptionCard } from '@/features/listings/components/EquipmentDescriptionCard';
import { DeliveryAvailableBanner } from '@/features/listings/components/DeliveryAvailableBanner';
import { AttachmentsSection } from '@/features/listings/components/AttachmentsSection';
import { listingsApi, isEquipmentListing, isGoldListing, isServiceListing } from '@/features/listings/api/listingsApi';
import { ListingMessageSheet } from '@/features/listings/components/ListingMessageSheet';
import { ListingOfferComposer } from '@/features/listings/components/ListingOfferComposer';
import { ListingOffersPanel } from '@/features/listings/components/ListingOffersPanel';
import { Button } from '@/shared/components/Button';
import { showAppAlert } from '@/shared/services/appAlert';
import { ApiError } from '@/shared/services/api';
import { useCurrency } from '@/shared/hooks/useCurrency';
import { useListingsStore } from '@/store/listingsStore';
import { useMarketListingsStore } from '@/store/marketListingsStore';
import { useProfileStore } from '@/store/profileStore';
import { useServiceListingsStore } from '@/store/serviceListingsStore';
import { useGoldListingsStore } from '@/store/goldListingsStore';
import { formatAmountWithCommas } from '@/shared/utils/formatAmount';
import { rfqStatusLabel } from '@/features/listings/utils/rfqStatus';
import { cacheListing } from '@/features/listings/utils/refreshListings';
import { palette, radius, spacing } from '@/theme';

type Props = NativeStackScreenProps<RootStackParamList, 'CompleteListingDetail'>;
type DetailRow = { label: string; value: string };
type RentalDuration = 'hourly' | 'weekly' | 'monthly';
/** Loose shape covering both EquipmentMediaAsset and ServiceMediaAsset — this screen only needs id/uri/kind/name. */
type AnyMediaAsset = { id: string; uri: string; kind: string; name?: string };

/** Published-listing detail screen shared by equipment, service and gold auction listings. */
export function CompleteListingDetailScreen({ navigation, route }: Props): React.ReactElement {
  const { id, category } = route.params;
  const { t } = useTranslation(undefined, { i18n: appI18n });
  const { currentLanguage } = useLanguage();
  const insets = useSafeAreaInsets();
  const currency = useCurrency();

  const profileId = useProfileStore((state) => state.profile?.id);
  const marketListing = useMarketListingsStore((state) =>
    state.listings.find((item) => item.id === id),
  );
  const mineEquipment = useListingsStore((state) =>
    category === 'equipment' ? state.listings.find((item) => item.id === id) : undefined,
  );
  const mineService = useServiceListingsStore((state) =>
    category === 'services' ? state.listings.find((item) => item.id === id) : undefined,
  );
  const mineGold = useGoldListingsStore((state) =>
    category === 'gold' ? state.listings.find((item) => item.id === id) : undefined,
  );

  const equipmentListing =
    (category === 'equipment' && marketListing && isEquipmentListing(marketListing) && marketListing.rfq
      ? marketListing
      : undefined) ??
    (mineEquipment?.rfq ? mineEquipment : undefined) ??
    (category === 'equipment' && marketListing && isEquipmentListing(marketListing)
      ? marketListing
      : undefined) ??
    mineEquipment;
  const serviceListing =
    (category === 'services' && marketListing && isServiceListing(marketListing) && marketListing.rfq
      ? marketListing
      : undefined) ??
    (mineService?.rfq ? mineService : undefined) ??
    (category === 'services' && marketListing && isServiceListing(marketListing)
      ? marketListing
      : undefined) ??
    mineService;
  const goldListing =
    (mineGold?.owner ? mineGold : undefined) ??
    (category === 'gold' && marketListing && isGoldListing(marketListing)
      ? marketListing
      : undefined) ??
    mineGold;

  useFocusEffect(
    React.useCallback(() => {
      let cancelled = false;
      void listingsApi
        .get(id)
        .then((listing) => {
          if (!cancelled) cacheListing(listing);
        })
        .catch(() => undefined);
      return () => {
        cancelled = true;
      };
    }, [id]),
  );

  const [viewerIndex, setViewerIndex] = React.useState<number | null>(null);
  const [selectedDuration, setSelectedDuration] = React.useState<RentalDuration | null>(null);
  const [messageOpen, setMessageOpen] = React.useState(false);
  const [offerSubmitting, setOfferSubmitting] = React.useState(false);
  const [actingOfferId, setActingOfferId] = React.useState<string | null>(null);

  const backButton = (
    <Pressable
      onPress={navigation.goBack}
      hitSlop={12}
      style={[styles.backButton, { top: insets.top + spacing.sm }]}
      accessibilityRole="button"
      accessibilityLabel={t('common.back')}
    >
      <Ionicons name="chevron-back" size={20} color={palette.pureWhite} />
    </Pressable>
  );

  const notFound = (
    <View style={styles.root}>
      <StatusBar style="dark" />
      {backButton}
      <View style={styles.notFoundWrap}>
        <AppText style={styles.notFound}>{t('requests.notFound')}</AppText>
      </View>
    </View>
  );

  if (category === 'equipment' && !equipmentListing) return notFound;
  if (category === 'services' && !serviceListing) return notFound;
  if (category === 'gold' && !goldListing) return notFound;

  let title = '';
  let media: AnyMediaAsset[] = [];
  let documents: AnyMediaAsset[] = [];
  let description = '';
  let location = '';
  let detailRows: DetailRow[] = [];
  let priceNode: React.ReactNode = null;
  let extraSection: React.ReactNode = null;

  if (category === 'equipment' && equipmentListing) {
    const isRent = equipmentListing.mode === 'rent';
    title = equipmentListing.title;
    media = equipmentListing.media;
    description = equipmentListing.description ?? '';
    location = equipmentListing.location ?? '';
    detailRows = [
      { label: t('equipmentListing.equipmentType'), value: equipmentListing.equipmentTypeLabel },
      { label: t('equipmentListing.units'), value: String(equipmentListing.units) },
      ...(equipmentListing.rfq
        ? [
            {
              label: t('rfq.statusLabel'),
              value: rfqStatusLabel(t, equipmentListing.rfq),
            },
            ...(equipmentListing.rfq.offersCount !== undefined
              ? [
                  {
                    label: t('rfq.offersCount'),
                    value: String(equipmentListing.rfq.offersCount),
                  },
                ]
              : []),
          ]
        : []),
    ].filter((row) => (row.value ?? '').trim().length > 0);

    const durationOptions = isRent
      ? (
          [
            equipmentListing.hourlyRental
              ? {
                  key: 'hourly' as const,
                  amount: equipmentListing.hourlyRental,
                  unit: t('equipmentListing.hourlyUnit'),
                  label: t('equipmentListing.hourlyBadge'),
                }
              : null,
            equipmentListing.weeklyRental
              ? {
                  key: 'weekly' as const,
                  amount: equipmentListing.weeklyRental,
                  unit: t('equipmentListing.weeklyUnit'),
                  label: t('equipmentListing.weeklyBadge'),
                }
              : null,
            equipmentListing.monthlyRental
              ? {
                  key: 'monthly' as const,
                  amount: equipmentListing.monthlyRental,
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
      : equipmentListing.salePrice
        ? { amount: equipmentListing.salePrice, unit: '' }
        : null;

    priceNode = price ? (
      <View style={styles.priceRow}>
        <View style={styles.priceValueRow}>
          <AppText weight="bold" style={styles.priceAmount}>
            {currency.code} {formatAmountWithCommas(price.amount)}
          </AppText>
          {price.unit ? <AppText style={styles.priceUnit}>{price.unit}</AppText> : null}
        </View>

        {durationOptions.length > 1 ? (
          <View style={styles.durationDropdown}>
            <SelectField
              placeholder={t('equipmentListing.durationPlaceholder')}
              sheetTitle={t('equipmentListing.durationPlaceholder')}
              options={durationOptions.map((option) => ({
                value: option.key,
                label: option.label,
              }))}
              value={activeDuration?.key ?? null}
              onChange={(next) => setSelectedDuration(next as RentalDuration)}
              compact
              dropdown
            />
          </View>
        ) : null}
      </View>
    ) : null;

    const deliverySubtitle = equipmentListing.deliveryAvailable
      ? equipmentListing.deliveryType === 'free'
        ? t('equipmentListing.deliveryFree')
        : `${t('equipmentListing.deliveryPerKm')} · ${currency.code} ${formatAmountWithCommas(equipmentListing.deliveryPricePerKm)}`
      : undefined;
    extraSection = equipmentListing.deliveryAvailable ? (
      <DeliveryAvailableBanner subtitle={deliverySubtitle} />
    ) : null;
  } else if (category === 'services' && serviceListing) {
    title = serviceListing.title;
    media = serviceListing.media;
    documents = serviceListing.media.filter((item) => item.kind === 'document');
    description = serviceListing.description ?? '';
    location = serviceListing.location ?? '';
    detailRows = [
      { label: t('serviceListing.serviceCategory'), value: serviceListing.serviceCategoryLabel },
      {
        label: t('serviceListing.yearsOfExperience'),
        value: serviceListing.yearsOfExperience
          ? t('serviceListing.yearsOfExperienceValue', { years: serviceListing.yearsOfExperience })
          : '',
      },
      {
        label: t('serviceListing.type'),
        value: t(
          serviceListing.serviceType === 'onsite'
            ? 'serviceListing.onsite'
            : 'serviceListing.online',
        ),
      },
      {
        label: t('serviceListing.dateTimeLabel'),
        value: serviceListing.serviceDate
          ? new Intl.DateTimeFormat(currentLanguage, {
              dateStyle: 'medium',
              timeStyle: 'short',
            }).format(serviceListing.serviceDate)
          : '',
      },
      ...(serviceListing.rfq
        ? [
            {
              label: t('rfq.statusLabel'),
              value: rfqStatusLabel(t, serviceListing.rfq),
            },
            ...(serviceListing.rfq.offersCount !== undefined
              ? [
                  {
                    label: t('rfq.offersCount'),
                    value: String(serviceListing.rfq.offersCount),
                  },
                ]
              : []),
          ]
        : []),
    ].filter((row) => (row.value ?? '').trim().length > 0);

    priceNode = serviceListing.price ? (
      <AppText weight="bold" style={styles.priceAmount}>
        {currency.code} {formatAmountWithCommas(serviceListing.price)}
      </AppText>
    ) : null;

    extraSection = <AttachmentsSection documents={documents} />;
  } else if (category === 'gold' && goldListing) {
    title = goldListing.title;
    media = goldListing.media;
    documents = goldListing.media.filter((item) => item.kind === 'document');
    description = goldListing.description ?? '';
    location = goldListing.location ?? '';
    detailRows = [
      { label: t('goldListing.purity'), value: goldListing.purityLabel },
      {
        label: t('goldListing.weight'),
        value: goldListing.weight
          ? t('goldListing.weightValue', { weight: goldListing.weight })
          : '',
      },
      {
        label: t('goldListing.auctionEndDate'),
        value: goldListing.auctionEndDate
          ? new Intl.DateTimeFormat(currentLanguage, {
              dateStyle: 'medium',
              timeStyle: 'short',
            }).format(goldListing.auctionEndDate)
          : '',
      },
    ].filter((row) => (row.value ?? '').trim().length > 0);

    priceNode = goldListing.price ? (
      <AppText weight="bold" style={styles.priceAmount}>
        {currency.code} {formatAmountWithCommas(goldListing.price)}
      </AppText>
    ) : null;

    extraSection = <AttachmentsSection documents={documents} />;
  }

  const visualMedia = media
    .filter((item) => item.kind === 'photo' || item.kind === 'video')
    .map((item) => ({
      id: item.id,
      uri: item.uri,
      kind: item.kind as 'photo' | 'video',
    }));
  const descriptionText = description.trim();
  const locationLabel = location;

  const handleOpenLocation = () => {
    if (!locationLabel.trim()) return;
    const query = encodeURIComponent(locationLabel);
    void Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${query}`);
  };

  const owner = equipmentListing?.owner ?? serviceListing?.owner ?? goldListing?.owner;
  const ownerId =
    equipmentListing?.ownerId ?? serviceListing?.ownerId ?? goldListing?.ownerId ?? owner?.id;
  const postedAs = equipmentListing?.postedAs ?? serviceListing?.postedAs ?? goldListing?.postedAs;
  const rfq = equipmentListing?.rfq ?? serviceListing?.rfq;
  const hasSentOffer = Boolean(
    rfq?.myOfferStatus && ['active', 'selected', 'confirmed'].includes(rfq.myOfferStatus),
  ) || rfq?.status === 'offer-submitted';
  const isOwner = Boolean(ownerId && profileId && ownerId === profileId);
  const canOffer =
    (category === 'equipment' || category === 'services') &&
    postedAs === 'supplier' &&
    Boolean(rfq) &&
    !isOwner &&
    !hasSentOffer;
  const canMessage = Boolean(owner) && !isOwner && !canOffer && !hasSentOffer;
  const showOwnerOffers = isOwner && (category === 'equipment' || category === 'services') && Boolean(rfq);

  const handleSubmitOffer = (price: string) => {
    setOfferSubmitting(true);
    void listingsApi
      .submitOffer(id, price)
      .then((listing) => {
        cacheListing(listing);
      })
      .catch((error: unknown) => {
        const message =
          error instanceof ApiError ? error.message : t('rfq.offerFailed');
        showAppAlert(t('common.error'), message);
      })
      .finally(() => setOfferSubmitting(false));
  };

  const handleDecideOffer = (offerId: string, action: 'accept' | 'reject') => {
    setActingOfferId(offerId);
    const request =
      action === 'accept' ? listingsApi.acceptOffer : listingsApi.rejectOffer;
    void request(id, offerId)
      .then((listing) => {
        cacheListing(listing);
      })
      .catch((error: unknown) => {
        const message = error instanceof ApiError ? error.message : t('rfq.actionFailed');
        showAppAlert(t('common.error'), message);
      })
      .finally(() => setActingOfferId(null));
  };

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar style="light" />

      <ScrollView showsVerticalScrollIndicator={false}>
        <EquipmentImageCarousel
          media={visualMedia}
          onPressImage={setViewerIndex}
          style={styles.carousel}
        />

        <View style={styles.content}>
          <View style={styles.headerBlock}>
            {priceNode}

            <View style={styles.titleBlock}>
              {rfq ? (
                <View style={styles.rfqStatusChip}>
                  <AppText weight="semibold" style={styles.rfqStatusChipText}>
                    {rfqStatusLabel(t, rfq)}
                  </AppText>
                </View>
              ) : null}
              <AppText weight="bold" style={styles.title}>
                {title}
              </AppText>

              {locationLabel.trim() ? (
                <Pressable
                  onPress={handleOpenLocation}
                  style={({ pressed }) => [
                    styles.locationRow,
                    pressed && styles.locationRowPressed,
                  ]}
                  accessibilityRole="button"
                  accessibilityLabel={locationLabel}
                >
                  <Ionicons name="location-outline" size={16} color={palette.gold} />
                  <AppText style={styles.locationText} numberOfLines={1}>
                    {locationLabel}
                  </AppText>
                  <Ionicons name="open-outline" size={14} color={palette.muted} />
                </Pressable>
              ) : null}
            </View>
          </View>

          <EquipmentListingSummaryCard detailRows={detailRows} media={[]} hideMedia />

          {descriptionText ? <EquipmentDescriptionCard description={descriptionText} /> : null}

          {extraSection}

          {showOwnerOffers ? (
            <ListingOffersPanel
              offers={rfq?.offers ?? []}
              currencyCode={currency.code}
              actingOfferId={actingOfferId}
              onAccept={(offerId) => handleDecideOffer(offerId, 'accept')}
              onReject={(offerId) => handleDecideOffer(offerId, 'reject')}
            />
          ) : null}
        </View>
      </ScrollView>

      {backButton}

      {canOffer || hasSentOffer ? (
        <ListingOfferComposer
          currencyCode={currency.code}
          placeholder={t('rfq.offerPlaceholder')}
          sendLabel={t('rfq.sendOffer')}
          submittedLabel={t('rfq.offerSubmitted')}
          hasOffer={hasSentOffer}
          submitting={offerSubmitting}
          onSubmit={handleSubmitOffer}
        />
      ) : null}

      {canMessage ? (
        <View style={[styles.messageBar, { paddingBottom: Math.max(insets.bottom, spacing.md) }]}>
          <Button
            label={t('messages.message')}
            icon="chatbubble-ellipses-outline"
            onPress={() => setMessageOpen(true)}
          />
        </View>
      ) : null}

      {owner ? (
        <ListingMessageSheet
          visible={messageOpen}
          listingId={id}
          owner={owner}
          onClose={() => setMessageOpen(false)}
        />
      ) : null}

      <EquipmentImageViewerModal
        visible={viewerIndex !== null}
        media={visualMedia}
        initialIndex={viewerIndex ?? 0}
        onClose={() => setViewerIndex(null)}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: palette.pureWhite,
  },
  content: {
    padding: spacing.lg,
    gap: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  headerBlock: {
    gap: spacing.xs,
  },
  carousel: {
    borderRadius: 0,
  },
  backButton: {
    position: 'absolute',
    left: spacing.md,
    width: 40,
    height: 40,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(0,0,0,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
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
  durationDropdown: {
    width: 90,
  },
  titleBlock: {
    gap: spacing.xs,
  },
  title: {
    fontSize: 18,
    color: palette.charcoal,
  },
  rfqStatusChip: {
    alignSelf: 'flex-start',
    backgroundColor: palette.gold,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
  },
  rfqStatusChipText: {
    fontSize: 11,
    color: palette.pureWhite,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    alignSelf: 'flex-start',
  },
  locationRowPressed: {
    opacity: 0.7,
  },
  locationText: {
    fontSize: 14,
    color: palette.gold,
    textDecorationLine: 'underline',
  },
  notFoundWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  notFound: {
    fontSize: 14,
    color: palette.muted,
    textAlign: 'center',
  },
  messageBar: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    backgroundColor: palette.pureWhite,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: palette.softGold,
  },
});
