import React from 'react';
import { ActivityIndicator, Linking, Pressable, ScrollView, StyleSheet, View } from 'react-native';
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
import { AttachmentsSection } from '@/features/listings/components/AttachmentsSection';
import { listingsApi, isEquipmentListing, isGoldListing, isServiceListing } from '@/features/listings/api/listingsApi';
import type { EquipmentMediaAsset } from '@/features/listings/types/equipmentMedia.types';
import type { ServiceMediaAsset } from '@/features/listings/types/serviceMedia.types';
import type { AttachmentDocument } from '@/features/listings/types/attachmentsSection.types';
import type { ListingDto } from '@/features/listings/api/listingsApi';
import { ListingMessageSheet } from '@/features/listings/components/ListingMessageSheet';
import { ListingOfferComposer } from '@/features/listings/components/ListingOfferComposer';
import { EquipmentDealsSection } from '@/features/listings/components/EquipmentDealsSection';
import { ListingOffersPanel } from '@/features/listings/components/ListingOffersPanel';
import { AppBottomSheet } from '@/shared/components/AppBottomSheet';
import { Button } from '@/shared/components/Button';
import { CounterField } from '@/shared/components/CounterField';
import { showAppAlert } from '@/shared/services/appAlert';
import { ApiError } from '@/shared/services/api';
import { useCurrency } from '@/shared/hooks/useCurrency';
import { useListingsStore } from '@/store/listingsStore';
import { useMarketListingsStore } from '@/store/marketListingsStore';
import { useOfferedListingsStore } from '@/store/offeredListingsStore';
import { useProfileStore } from '@/store/profileStore';
import { useServiceListingsStore } from '@/store/serviceListingsStore';
import { useGoldListingsStore } from '@/store/goldListingsStore';
import { formatAmountWithCommas } from '@/shared/utils/formatAmount';
import { openWhatsApp } from '@/shared/utils/openWhatsApp';
import { isEndedRfqStatus, rfqStatusBadge } from '@/features/listings/utils/rfqStatus';
import { serviceTypeLabels, resolveServicePrices } from '@/features/listings/utils/serviceType';
import { cacheListing } from '@/features/listings/utils/refreshListings';
import { palette, radius, spacing } from '@/theme';

type Props = NativeStackScreenProps<RootStackParamList, 'CompleteListingDetail'>;
type DetailRow = {
  label: string;
  value: string;
  hint?: string;
  onEdit?: () => void;
};
type RentalDuration = 'hourly' | 'weekly' | 'monthly' | 'yearly';
/** Loose shape covering both EquipmentMediaAsset and ServiceMediaAsset — this screen only needs id/uri/kind/name. */
function formatListingDate(locale: string, epoch: number | null | undefined): string {
  if (!epoch) return '';
  return new Intl.DateTimeFormat(locale, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(epoch));
}

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

  const offeredListing = useOfferedListingsStore((state) =>
    state.listings.find((item) => item.id === id),
  );
  const [fetchedListing, setFetchedListing] = React.useState<ListingDto | null>(null);
  const [loadFailed, setLoadFailed] = React.useState(false);
  const [unitsEditorOpen, setUnitsEditorOpen] = React.useState(false);
  const [editUnits, setEditUnits] = React.useState(1);
  const [savingUnits, setSavingUnits] = React.useState(false);
  const [deletingListing, setDeletingListing] = React.useState(false);

  const applyListing = React.useCallback((listing: ListingDto) => {
    setFetchedListing(listing);
    setLoadFailed(false);
    cacheListing(listing);
  }, []);
  const hasListingRef = React.useRef(false);

  const source =
    (fetchedListing?.id === id ? fetchedListing : undefined) ??
    offeredListing ??
    marketListing ??
    mineEquipment ??
    mineService ??
    mineGold;

  const equipmentListing =
    category === 'equipment' && source && isEquipmentListing(source) ? source : undefined;
  const unitsLeft = supplierUnitsLeft(id, [
    fetchedListing,
    marketListing,
    equipmentListing,
    offeredListing,
    mineEquipment,
  ]);
  const serviceListing =
    category === 'services' && source && isServiceListing(source) ? source : undefined;
  const goldListing = category === 'gold' && source && isGoldListing(source) ? source : undefined;
  hasListingRef.current = Boolean(equipmentListing || serviceListing || goldListing);

  useFocusEffect(
    React.useCallback(() => {
      let cancelled = false;
      const reload = () =>
        listingsApi
          .get(id)
          .then((listing) => {
            if (!cancelled) applyListing(listing);
          })
          .catch(() => {
            if (!cancelled && !hasListingRef.current) {
              setLoadFailed(true);
            }
          });
      void reload();
      const timer = setInterval(() => {
        void reload();
      }, 5000);
      return () => {
        cancelled = true;
        clearInterval(timer);
      };
    }, [applyListing, id]),
  );
  const [viewerIndex, setViewerIndex] = React.useState<number | null>(null);
  const [selectedDuration, setSelectedDuration] = React.useState<RentalDuration | null>(null);
  const [servicePriceMode, setServicePriceMode] = React.useState<'online' | 'onsite'>('online');
  const [messageOpen, setMessageOpen] = React.useState(false);
  const [messagePeer, setMessagePeer] = React.useState<{
    id: string;
    fullName: string;
    avatarUrl: string | null;
  } | null>(null);
  const [offerSubmitting, setOfferSubmitting] = React.useState(false);
  const [actingOfferId, setActingOfferId] = React.useState<string | null>(null);
  const countdownEnd =
    (equipmentListing ?? serviceListing ?? goldListing)?.rfq?.expiresAt ??
    goldListing?.auctionEndDate ??
    null;
  const timeLeft = useCountdown(countdownEnd);

  const backButton = (
    <Pressable
      onPress={navigation.goBack}
      hitSlop={12}
      style={[styles.overlayButton, styles.backButton, { top: insets.top + spacing.sm }]}
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

  const missing =
    (category === 'equipment' && !equipmentListing) ||
    (category === 'services' && !serviceListing) ||
    (category === 'gold' && !goldListing);

  if (missing && loadFailed) return notFound;
  if (missing) {
    return (
      <View style={styles.root}>
        <StatusBar style="dark" />
        {backButton}
        <View style={styles.notFoundWrap}>
          <ActivityIndicator color={palette.gold} />
        </View>
      </View>
    );
  }

  let title = '';
  let media: Array<EquipmentMediaAsset | ServiceMediaAsset> = [];
  let documents: AttachmentDocument[] = [];
  let description = '';
  let location = '';
  let detailRows: DetailRow[] = [];
  let priceNode: React.ReactNode = null;
  let extraSection: React.ReactNode = null;

  if (category === 'equipment' && equipmentListing) {
    const offersRent = equipmentListing.mode === 'rent' || equipmentListing.mode === 'both';
    const offersSell = equipmentListing.mode === 'sell' || equipmentListing.mode === 'both';
    title = equipmentListing.title;
    media = equipmentListing.media;
    description = equipmentListing.description ?? '';
    location = equipmentListing.location ?? '';
    const ownerCanEditUnits =
      equipmentListing.postedAs === 'supplier' &&
      Boolean(
        profileId && (equipmentListing.ownerId ?? equipmentListing.owner?.id) === profileId,
      );
    detailRows = [
      { label: t('common.reference'), value: equipmentListing.reference ?? '' },
      { label: t('equipmentListing.equipmentType'), value: equipmentListing.equipmentTypeLabel },
      {
        label: t(
          equipmentListing.postedAs === 'supplier'
            ? 'equipmentListing.availableUnits'
            : 'equipmentListing.units',
        ),
        value: String(
          equipmentListing.postedAs === 'supplier' ? unitsLeft : equipmentListing.units,
        ),
        ...(ownerCanEditUnits
          ? {
              onEdit: () => {
                setEditUnits(unitsLeft);
                setUnitsEditorOpen(true);
              },
            }
          : {}),
      },
      {
        label: t('equipmentListing.neededDate'),
        value: formatListingDate(currentLanguage, equipmentListing.neededDate),
      },
      {
        label: t('common.postedOn'),
        value: formatListingDate(currentLanguage, equipmentListing.createdAt),
      },
      ...(equipmentListing.postedAs === 'supplier'
        ? []
        : [
            {
              label: t('equipmentListing.listedUntil'),
              value: formatListingDate(currentLanguage, equipmentListing.rfq?.expiresAt),
            },
          ]),
    ].filter((row) => (row.value ?? '').trim().length > 0);

    if (equipmentListing.postedAs !== 'buyer' && equipmentListing.deliveryAvailable) {
      detailRows.push({
        label: t('equipmentListing.deliveryBadge'),
        ...(equipmentListing.deliveryType === 'free'
          ? { value: t('equipmentListing.deliveryFree') }
          : {
              value: `${currency.code} ${formatAmountWithCommas(equipmentListing.deliveryPricePerKm)} ·`,
              hint: t('equipmentListing.deliveryPerKm'),
            }),
      });
    }

    const durationOptions = offersRent
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
            equipmentListing.yearlyRental
              ? {
                  key: 'yearly' as const,
                  amount: equipmentListing.yearlyRental,
                  unit: t('equipmentListing.yearlyUnit'),
                  label: t('equipmentListing.yearlyBadge'),
                }
              : null,
          ] as const
        ).filter((option): option is NonNullable<typeof option> => option !== null)
      : [];

    const activeDuration =
      durationOptions.find((option) => option.key === selectedDuration) ?? durationOptions[0];

    const price = activeDuration
      ? { amount: activeDuration.amount, unit: activeDuration.unit }
      : offersSell && equipmentListing.salePrice
        ? { amount: equipmentListing.salePrice, unit: '' }
        : null;
    if (offersSell && equipmentListing.salePrice && activeDuration) {
      detailRows.push({
        label: t('equipmentListing.salePrice'),
        value: `${currency.code} ${formatAmountWithCommas(equipmentListing.salePrice)}`,
      });
    }

    priceNode =
      equipmentListing.postedAs === 'buyer' || !price ? null : (
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
    );

  } else if (category === 'services' && serviceListing) {
    title = serviceListing.title;
    media = serviceListing.media;
    documents = serviceListing.media.filter((item) => item.kind === 'document');
    description = serviceListing.description ?? '';
    location = serviceListing.location ?? '';
    detailRows = [
      { label: t('common.reference'), value: serviceListing.reference ?? '' },
      { label: t('serviceListing.serviceCategory'), value: serviceListing.serviceCategoryLabel },
      {
        label: t(
          serviceListing.postedAs === 'buyer'
            ? 'serviceListing.yearsOfExperienceWanted'
            : 'serviceListing.yearsOfExperience',
        ),
        value: serviceListing.yearsOfExperience
          ? t('serviceListing.yearsOfExperienceValue', { years: serviceListing.yearsOfExperience })
          : '',
      },
      {
        label: t('serviceListing.type'),
        value: serviceTypeLabels(t, serviceListing.serviceType).join(' / '),
      },
      {
        label: t('serviceListing.listedUntil'),
        value: formatListingDate(currentLanguage, serviceListing.rfq?.expiresAt),
      },
    ].filter((row) => (row.value ?? '').trim().length > 0);

    const servicePrices = resolveServicePrices(serviceListing);
    const servicePriceOptions = (
      [
        servicePrices.onlinePrice
          ? {
              key: 'online' as const,
              amount: servicePrices.onlinePrice,
              label: t('serviceListing.online'),
            }
          : null,
        servicePrices.onsitePrice
          ? {
              key: 'onsite' as const,
              amount: servicePrices.onsitePrice,
              label: t('serviceListing.onsite'),
            }
          : null,
      ] as const
    ).filter((option): option is NonNullable<typeof option> => option !== null);
    const activeServicePrice =
      servicePriceOptions.find((option) => option.key === servicePriceMode) ??
      servicePriceOptions[0];
    priceNode =
      serviceListing.postedAs === 'buyer' || !activeServicePrice ? null : (
      <View style={styles.priceRow}>
        <View style={styles.priceValueRow}>
          <AppText weight="bold" style={styles.priceAmount}>
            {currency.code} {formatAmountWithCommas(activeServicePrice.amount)}
          </AppText>
        </View>
        {servicePriceOptions.length > 1 ? (
          <View style={styles.serviceModeRow}>
            {servicePriceOptions.map((option) => {
              const selected = option.key === activeServicePrice.key;
              return (
                <Pressable
                  key={option.key}
                  onPress={() => setServicePriceMode(option.key)}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  style={[styles.serviceModeButton, selected && styles.serviceModeButtonSelected]}
                >
                  <AppText
                    weight="semibold"
                    style={[styles.serviceModeLabel, selected && styles.serviceModeLabelSelected]}
                  >
                    {option.label}
                  </AppText>
                </Pressable>
              );
            })}
          </View>
        ) : null}
      </View>
    );

    extraSection = <AttachmentsSection documents={documents} />;
  } else if (category === 'gold' && goldListing) {
    title = goldListing.title;
    media = goldListing.media;
    documents = goldListing.media.filter((item) => item.kind === 'document');
    description = goldListing.description ?? '';
    location = goldListing.location ?? '';
    detailRows = [
      { label: t('common.reference'), value: goldListing.reference ?? '' },
      { label: t('goldListing.purity'), value: goldListing.purityLabel },
      {
        label: t('goldListing.weight'),
        value: goldListing.weight
          ? t('goldListing.weightValue', { weight: goldListing.weight })
          : '',
      },
      {
        label: t('goldListing.auctionEndDate'),
        value: formatListingDate(
          currentLanguage,
          goldListing.auctionEndDate ?? goldListing.createdAt,
        ),
      },
    ].filter((row) => (row.value ?? '').trim().length > 0);

    priceNode =
      goldListing.postedAs === 'buyer' || !goldListing.price ? null : (
      <AppText weight="bold" style={styles.priceAmount}>
        {currency.code} {formatAmountWithCommas(goldListing.price)}
      </AppText>
    );

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
  const rfq = equipmentListing?.rfq ?? serviceListing?.rfq ?? goldListing?.rfq;
  const hasSentOffer = Boolean(
    rfq?.myOfferStatus && ['active', 'selected', 'confirmed'].includes(rfq.myOfferStatus),
  ) || rfq?.status === 'offer-submitted';
  const isOwner = Boolean(ownerId && profileId && ownerId === profileId);
  const canOffer =
    Boolean(rfq) &&
    !isOwner &&
    (rfq?.canSubmitOffer ?? (!hasSentOffer && Boolean(postedAs)));
  const awaitingConfirm =
    rfq?.myOfferStatus === 'selected' ||
    rfq?.status === 'awaiting-your-confirmation' ||
    Boolean(rfq?.canConfirmOffer);
  const supplierBuyer =
    !isOwner && category === 'equipment' && equipmentListing?.postedAs === 'supplier';
  const mySupplierOffers = supplierBuyer
    ? (rfq?.offers ?? []).filter((offer) => offer.responderId === profileId)
    : [];
  const showOfferInput =
    (supplierBuyer
      ? unitsLeft > 0 && rfq?.canSubmitOffer !== false
      : !awaitingConfirm &&
        (canOffer || (category === 'gold' && hasSentOffer && rfq?.status === 'live')));
  const canMessage = Boolean(owner) && !isOwner && hasSentOffer;
  const canWithdraw =
    !awaitingConfirm &&
    (Boolean(rfq?.canWithdrawOffer) ||
      rfq?.myOfferStatus === 'active' ||
      rfq?.status === 'offer-submitted');
  const showOwnerOffers = isOwner && Boolean(rfq);
  const showCountdown =
    equipmentListing?.postedAs !== 'supplier' &&
    countdownEnd != null &&
    !isEndedRfqStatus(rfq?.status) &&
    timeLeft != null;
  const headerBadge =
    rfqStatusBadge(t, rfq) ??
    (equipmentListing && equipmentListing.postedAs !== 'buyer'
      ? {
          key: 'mode',
          label: [
            equipmentListing.mode === 'rent' || equipmentListing.mode === 'both'
              ? t('equipmentListing.rent')
              : null,
            equipmentListing.mode === 'sell' || equipmentListing.mode === 'both'
              ? t('equipmentListing.sell')
              : null,
          ]
            .filter(Boolean)
            .join(' · '),
          variant: 'accent' as const,
        }
      : null);

  const handleSubmitOffer = (
    price: string,
    units?: number,
    choice?: 'rent' | 'sale' | 'onsite' | 'online',
  ) => {
    const fulfillment = choice === 'rent' || choice === 'sale' ? choice : undefined;
    const delivery = choice === 'onsite' || choice === 'online' ? choice : undefined;
    setOfferSubmitting(true);
    void listingsApi
      .submitOffer(id, price, category === 'equipment' ? units : undefined, fulfillment, delivery)
      .then((listing) => {
        applyListing(listing);
      })
      .catch((error: unknown) => {
        const message =
          error instanceof ApiError ? error.message : t('rfq.offerFailed');
        if (message === 'You already have an open offer of this type') return;
        showAppAlert(t('common.error'), message);
      })
      .finally(() => setOfferSubmitting(false));
  };

  const handleDecideOffer = (offerId: string, action: 'accept' | 'reject') => {
    if (
      action === 'accept' &&
      category === 'equipment' &&
      equipmentListing?.postedAs === 'supplier'
    ) {
      const requested =
        rfq?.offers?.find((offer) => offer.id === offerId)?.quantity ?? 1;
      if (unitsLeft <= 0) {
        showAppAlert(t('rfq.noUnitsAvailable'));
        return;
      }
      if (requested > unitsLeft) {
        showAppAlert(t('rfq.lessUnitsAvailable'));
        return;
      }
    }
    setActingOfferId(offerId);
    const request =
      action === 'accept' ? listingsApi.acceptOffer : listingsApi.rejectOffer;
    void request(id, offerId)
      .then((listing) => {
        applyListing(listing);
      })
      .catch((error: unknown) => {
        const message = error instanceof ApiError ? error.message : t('rfq.actionFailed');
        if (message === 'No units available') {
          showAppAlert(t('rfq.noUnitsAvailable'));
          return;
        }
        if (message === 'Less units available') {
          showAppAlert(t('rfq.lessUnitsAvailable'));
          return;
        }
        showAppAlert(t('common.error'), message);
      })
      .finally(() => setActingOfferId(null));
  };

  const handleResponderOffer = (
    action: 'confirm' | 'decline' | 'withdraw',
    offerId = rfq?.myOfferId,
  ) => {
    if (!offerId) return;
    const run = () => {
      setOfferSubmitting(true);
      const request =
        action === 'confirm'
          ? listingsApi.confirmOffer
          : action === 'decline'
            ? listingsApi.declineOffer
            : listingsApi.withdrawOffer;
      void request(id, offerId)
        .then((listing) => {
          applyListing(listing);
        })
        .catch((error: unknown) => {
          const message = error instanceof ApiError ? error.message : t('rfq.actionFailed');
          showAppAlert(t('common.error'), message);
        })
        .finally(() => setOfferSubmitting(false));
    };

    if (action === 'withdraw') {
      showAppAlert(t('rfq.withdrawConfirmTitle'), t('rfq.withdrawConfirmMessage'), [
        { text: t('common.cancel'), style: 'cancel' },
        { text: t('rfq.withdraw'), style: 'destructive', onPress: run },
      ]);
      return;
    }

    run();
  };

  return (
    <View style={styles.root}>
      <StatusBar style="light" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
      >
        <EquipmentImageCarousel
          media={visualMedia}
          onPressImage={setViewerIndex}
          style={styles.carousel}
        />

        <View style={styles.content}>
          <View style={styles.headerBlock}>
            {headerBadge || showCountdown ? (
              <View style={styles.statusRow}>
                {headerBadge ? (
                  <View
                    style={[
                      styles.rfqStatusChip,
                      headerBadge.variant === 'muted' && styles.rfqStatusChipMuted,
                      headerBadge.variant === 'warning' && styles.rfqStatusChipWarning,
                      headerBadge.variant === 'success' && styles.rfqStatusChipSuccess,
                    ]}
                  >
                    <AppText weight="semibold" style={styles.rfqStatusChipText}>
                      {headerBadge.label}
                    </AppText>
                  </View>
                ) : (
                  <View />
                )}
                {showCountdown ? (
                  <View style={styles.timerBadge}>
                    <Ionicons name="time-outline" size={12} color={palette.gold} />
                    <AppText weight="semibold" style={styles.timerText}>
                      {timeLeft}
                    </AppText>
                  </View>
                ) : null}
              </View>
            ) : null}

            {priceNode}

            <View style={styles.titleBlock}>
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

          <EquipmentListingSummaryCard
            detailRows={detailRows}
            media={[]}
            hideMedia
            description={descriptionText}
          />

          {extraSection}

          {isOwner && equipmentListing?.postedAs === 'supplier' ? (
            <Button
              label={t('equipmentListing.manageUnits')}
              icon="cube-outline"
              variant="outline"
              onPress={() => navigation.navigate('EquipmentStock', { id })}
            />
          ) : null}

          {showOwnerOffers &&
          (equipmentListing?.postedAs !== 'supplier' ||
            (rfq?.offers ?? []).some(
              (offer) => offer.status === 'active' || offer.status === 'selected',
            )) ? (
            <ListingOffersPanel
              offers={
                equipmentListing?.postedAs === 'supplier'
                  ? (rfq?.offers ?? []).filter(
                      (offer) => offer.status === 'active' || offer.status === 'selected',
                    )
                  : (rfq?.offers ?? [])
              }
              currencyCode={currency.code}
              actingOfferId={actingOfferId}
              canDecideOffers={rfq?.canDecideOffers !== false}
              rfqStatus={rfq?.status}
              showUnits={category === 'equipment'}
              showLeader={category === 'gold'}
              messageEveryOffer={category === 'gold'}
              onAccept={(offerId) => handleDecideOffer(offerId, 'accept')}
              onReject={(offerId) => handleDecideOffer(offerId, 'reject')}
              onMessage={(offer) => {
                setMessagePeer({
                  id: offer.responderId,
                  fullName: offer.responderName,
                  avatarUrl: null,
                });
                setMessageOpen(true);
              }}
            />
          ) : null}

          {supplierBuyer && mySupplierOffers.length > 0 ? (
            <View style={styles.myOffers}>
              <AppText weight="bold" style={styles.myOffersTitle}>
                {t('rfq.yourOffer')}
              </AppText>
              {mySupplierOffers.map((offer) => (
                <View key={offer.id} style={styles.myOfferCard}>
                  <View style={styles.myOfferRow}>
                    <AppText weight="semibold" style={styles.myOfferTitle}>
                      {offer.kind === 'sale' ? t('equipmentListing.sell') : t('equipmentListing.rent')}
                      {offer.quantity
                        ? ` · ${t('equipmentListing.unitsCount', { count: offer.quantity })}`
                        : ''}
                    </AppText>
                    <AppText style={styles.myOfferStatus}>
                      {t(
                        `rfq.offerStatus.${
                          offer.status === 'selected'
                            ? 'selected'
                            : offer.status === 'confirmed'
                              ? 'confirmed'
                              : 'active'
                        }`,
                      )}
                    </AppText>
                  </View>
                  {offer.price ? (
                    <AppText weight="bold" style={styles.myOfferPrice}>
                      {currency.code} {formatAmountWithCommas(offer.price)}
                    </AppText>
                  ) : null}
                  {offer.status === 'active' ? (
                    <Button
                      label={t('rfq.withdraw')}
                      variant="outline"
                      onPress={() => handleResponderOffer('withdraw', offer.id)}
                    />
                  ) : null}
                  {offer.status === 'selected' ? (
                    <View style={styles.myOfferActions}>
                      <Button
                        label={t('rfq.decline')}
                        variant="outline"
                        onPress={() => handleResponderOffer('decline', offer.id)}
                        style={styles.myOfferAction}
                      />
                      <Button
                        label={t('rfq.confirm')}
                        onPress={() => handleResponderOffer('confirm', offer.id)}
                        style={styles.myOfferAction}
                      />
                    </View>
                  ) : null}
                </View>
              ))}
            </View>
          ) : null}

          {isOwner && equipmentListing?.postedAs === 'supplier' ? (
            <EquipmentDealsSection
              listingId={id}
              revision={(rfq?.offers ?? []).map((offer) => `${offer.id}:${offer.status}`).join('|')}
              buyerPhones={Object.fromEntries(
                (rfq?.offers ?? [])
                  .filter((offer) => offer.responderPhone)
                  .map((offer) => [offer.responderId, offer.responderPhone as string]),
              )}
              onMessageBuyer={(buyer) => {
                setMessagePeer({ id: buyer.id, fullName: buyer.fullName, avatarUrl: null });
                setMessageOpen(true);
              }}
            />
          ) : null}
        </View>
      </ScrollView>

      {backButton}

      {isOwner ? (
        <Pressable
          onPress={() => {
            showAppAlert(
              t('equipmentListing.deleteListingTitle'),
              t('equipmentListing.deleteListingMessage'),
              [
                { text: t('common.cancel'), style: 'cancel' },
                {
                  text: t('common.delete'),
                  style: 'destructive',
                  onPress: () => {
                    setDeletingListing(true);
                    void listingsApi
                      .remove(id)
                      .then(() => {
                        useListingsStore
                          .getState()
                          .setListings(
                            useListingsStore.getState().listings.filter((item) => item.id !== id),
                          );
                        useServiceListingsStore
                          .getState()
                          .setListings(
                            useServiceListingsStore
                              .getState()
                              .listings.filter((item) => item.id !== id),
                          );
                        useGoldListingsStore
                          .getState()
                          .setListings(
                            useGoldListingsStore.getState().listings.filter((item) => item.id !== id),
                          );
                        useMarketListingsStore
                          .getState()
                          .setListings(
                            useMarketListingsStore
                              .getState()
                              .listings.filter((item) => item.id !== id),
                          );
                        useOfferedListingsStore
                          .getState()
                          .setListings(
                            useOfferedListingsStore
                              .getState()
                              .listings.filter((item) => item.id !== id),
                          );
                        navigation.goBack();
                      })
                      .catch((error: unknown) => {
                        const message = error instanceof ApiError ? error.message : t('common.error');
                        showAppAlert(message);
                      })
                      .finally(() => setDeletingListing(false));
                  },
                },
              ],
            );
          }}
          disabled={deletingListing}
          hitSlop={12}
          style={[
            styles.overlayButton,
            styles.deleteButton,
            { top: insets.top + spacing.sm },
            deletingListing && styles.withdrawDisabled,
          ]}
          accessibilityRole="button"
          accessibilityLabel={t('common.delete')}
        >
          <Ionicons name="trash-outline" size={18} color={palette.pureWhite} />
        </Pressable>
      ) : null}

      {canWithdraw && !supplierBuyer ? (
        <Pressable
          onPress={() => handleResponderOffer('withdraw')}
          disabled={offerSubmitting}
          hitSlop={12}
          style={[
            styles.overlayButton,
            styles.withdrawButton,
            { top: insets.top + spacing.sm },
            offerSubmitting && styles.withdrawDisabled,
          ]}
          accessibilityRole="button"
          accessibilityLabel={t('rfq.withdraw')}
        >
          <Ionicons name="arrow-undo-outline" size={16} color={palette.pureWhite} />
          <AppText weight="semibold" style={styles.withdrawLabel}>
            {t('rfq.withdraw')}
          </AppText>
        </Pressable>
      ) : null}

      {category === 'gold' && !isOwner && rfq?.currentPrice ? (
        <View style={styles.highestBid}>
          <AppText style={styles.highestBidLabel}>{t('goldListing.highestBid')}</AppText>
          <AppText weight="bold" style={styles.highestBidAmount}>
            {currency.code} {formatAmountWithCommas(rfq.currentPrice)}
          </AppText>
        </View>
      ) : null}

      {(supplierBuyer ? showOfferInput : showOfferInput || hasSentOffer) ? (
        <ListingOfferComposer
          currencyCode={currency.code}
          placeholder={
            category === 'gold' && hasSentOffer
              ? t('rfq.updateOfferPlaceholder')
              : t('rfq.offerPlaceholder')
          }
          sendLabel={t('rfq.sendOffer')}
          submittedLabel={
            awaitingConfirm
              ? t('rfq.offerStatus.selected')
              : rfq?.myOfferStatus === 'confirmed'
                ? t('rfq.offerStatus.confirmed')
                : category === 'gold'
                  ? t('rfq.yourOffer')
                  : t('rfq.offerSubmitted')
          }
          confirmLabel={t('rfq.confirm')}
          declineLabel={t('rfq.decline')}
          offerPrice={rfq?.myOfferPrice}
          offerUnits={category === 'equipment' ? rfq?.myOfferQuantity : undefined}
          offerUnitsLabel={
            category === 'equipment' && rfq?.myOfferQuantity
              ? t('equipmentListing.unitsCount', { count: rfq.myOfferQuantity })
              : undefined
          }
          unitsLabel={
            category === 'equipment'
              ? t('equipmentListing.unitsLeft', { count: unitsLeft })
              : undefined
          }
          unitPricePlaceholder={
            category === 'equipment' ? t('rfq.unitPricePlaceholder') : undefined
          }
          maxUnits={category === 'equipment' ? Math.max(unitsLeft, 0) : undefined}
          fulfillmentModes={
            category === 'equipment' && equipmentListing?.postedAs === 'supplier'
              ? equipmentListing.mode === 'both'
                ? ['rent', 'sale']
                : equipmentListing.mode === 'sell'
                  ? ['sale']
                  : ['rent']
              : category === 'services' && serviceListing?.serviceType === 'both'
                ? ['onsite', 'online']
                : undefined
          }
          fulfillmentLabels={{
            rent: t('equipmentListing.rent'),
            sale: t('equipmentListing.buy'),
            onsite: t('serviceListing.onsite'),
            online: t('serviceListing.online'),
          }}
          fulfillmentRentLabel={t('equipmentListing.rent')}
          fulfillmentSaleLabel={t('equipmentListing.buy')}
          blockedFulfillmentModes={
            supplierBuyer
              ? (['rent', 'sale'] as const).filter((kind) =>
                  mySupplierOffers.some(
                    (offer) =>
                      offer.kind === kind &&
                      (offer.status === 'active' || offer.status === 'selected'),
                  ),
                )
              : undefined
          }
          offerChoiceLabel={
            rfq?.myOfferDelivery === 'onsite'
              ? t('serviceListing.onsite')
              : rfq?.myOfferDelivery === 'online'
                ? t('serviceListing.online')
                : undefined
          }
          hasOffer={supplierBuyer ? false : hasSentOffer}
          leading={category === 'gold' && Boolean(rfq?.isLeading)}
          showInput={showOfferInput}
          awaitingConfirm={supplierBuyer ? false : awaitingConfirm}
          sendInline={supplierBuyer}
          submitting={offerSubmitting}
          onSubmit={handleSubmitOffer}
          onConfirm={() => handleResponderOffer('confirm')}
          onDecline={() => handleResponderOffer('decline')}
          footer={
            canMessage ? (
              <View style={styles.contactRow}>
                <Button
                  label={t('messages.message')}
                  icon="chatbubble-ellipses-outline"
                  onPress={() => setMessageOpen(true)}
                  style={styles.messageButton}
                />
                {(() => {
                  const whatsappReady = supplierBuyer
                    ? mySupplierOffers.some((offer) => offer.status === 'confirmed')
                    : rfq?.myOfferStatus === 'confirmed';
                  return whatsappReady && rfq?.ownerPhone ? (
                  <Button
                    label={t('common.whatsapp')}
                    icon="logo-whatsapp"
                    variant="whatsapp"
                    onPress={() => openWhatsApp(rfq.ownerPhone!)}
                    style={styles.messageButton}
                  />
                  ) : null;
                })()}
              </View>
            ) : null
          }
        />
      ) : null}

      {messagePeer || owner ? (
        <ListingMessageSheet
          visible={messageOpen}
          listingId={id}
          owner={messagePeer ?? owner!}
          buyerId={messagePeer?.id}
          onClose={() => {
            setMessageOpen(false);
            setMessagePeer(null);
          }}
        />
      ) : null}

      {equipmentListing?.postedAs === 'supplier' ? (
        <AppBottomSheet
          visible={unitsEditorOpen}
          onClose={() => setUnitsEditorOpen(false)}
          fitContent
        >
          <View style={styles.unitsEditor}>
            <CounterField
              label={t('equipmentListing.availableUnits')}
              value={editUnits}
              onChange={setEditUnits}
              min={Math.max(equipmentListing.units - unitsLeft, 0) === 0 ? 1 : 0}
              max={9999}
              required
            />
            <Button
              label={t('equipmentListing.saveUnits')}
              loading={savingUnits}
              disabled={editUnits === unitsLeft}
              onPress={() => {
                const reserved = Math.max(equipmentListing.units - unitsLeft, 0);
                setSavingUnits(true);
                void listingsApi
                  .updateEquipmentUnits(id, reserved + editUnits)
                  .then(() => listingsApi.get(id))
                  .then((listing) => {
                    applyListing(listing);
                    setUnitsEditorOpen(false);
                  })
                  .catch((error: unknown) => {
                    const message = error instanceof ApiError ? error.message : '';
                    if (message.includes('already rented or sold')) {
                      showAppAlert(t('equipmentListing.unitsBelowCommitted'));
                      return;
                    }
                    showAppAlert(t('common.error'), message || t('common.error'));
                  })
                  .finally(() => setSavingUnits(false));
              }}
            />
          </View>
        </AppBottomSheet>
      ) : null}

      <EquipmentImageViewerModal
        visible={viewerIndex !== null}
        media={visualMedia}
        initialIndex={viewerIndex ?? 0}
        onClose={() => setViewerIndex(null)}
      />
    </View>
  );
}

function supplierUnitsLeft(
  id: string,
  sources: Array<ListingDto | null | undefined>,
): number {
  for (const listing of sources) {
    if (!listing || !isEquipmentListing(listing) || listing.id !== id) continue;
    if (listing.postedAs === 'supplier' && listing.availableUnits != null) {
      return listing.availableUnits;
    }
  }
  for (const listing of sources) {
    if (listing && isEquipmentListing(listing) && listing.id === id) return listing.units;
  }
  return 1;
}

const DAY_MS = 24 * 60 * 60 * 1000;
const HOUR_MS = 60 * 60 * 1000;
const MINUTE_MS = 60 * 1000;

function useCountdown(endsAt: number | null | undefined): string | null {
  const [now, setNow] = React.useState(() => Date.now());

  React.useEffect(() => {
    if (endsAt == null) return undefined;
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [endsAt]);

  if (endsAt == null) return null;
  const remainingMs = Math.max(0, endsAt - now);
  if (remainingMs > DAY_MS) return `${Math.floor(remainingMs / DAY_MS)}d`;
  if (remainingMs >= HOUR_MS) return `${Math.floor(remainingMs / HOUR_MS)}h`;
  if (remainingMs >= MINUTE_MS) return `${Math.floor(remainingMs / MINUTE_MS)}m`;
  return `${Math.floor(remainingMs / 1000)}s`;
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
  overlayButton: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(0,0,0,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButton: {
    left: spacing.md,
  },
  deleteButton: {
    right: spacing.md,
  },
  withdrawButton: {
    right: spacing.md,
    width: undefined,
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: spacing.md,
  },
  withdrawLabel: {
    fontSize: 13,
    color: palette.pureWhite,
  },
  withdrawDisabled: {
    opacity: 0.4,
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
    flexWrap: 'wrap',
    flex: 1,
    gap: spacing.xs,
  },
  servicePrices: {
    gap: spacing.xs,
  },
  highestBid: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xs,
    backgroundColor: palette.warmWhite,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: palette.softGold,
  },
  highestBidLabel: {
    fontSize: 12,
    color: palette.muted,
  },
  highestBidAmount: {
    fontSize: 12,
    color: palette.charcoal,
  },
  myOffers: { gap: spacing.sm },
  myOffersTitle: { fontSize: 16, color: palette.charcoal },
  myOfferCard: {
    backgroundColor: palette.warmWhite,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: palette.softGold,
    padding: spacing.md,
    gap: spacing.sm,
  },
  myOfferRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  myOfferTitle: { flex: 1, fontSize: 14, color: palette.charcoal },
  myOfferStatus: { fontSize: 12, color: palette.goldDark },
  myOfferPrice: { fontSize: 16, color: palette.charcoal },
  myOfferActions: { flexDirection: 'row', gap: spacing.sm },
  myOfferAction: { flex: 1 },
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
  serviceModeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  serviceModeButton: {
    minHeight: 36,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: palette.softGold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  serviceModeButtonSelected: {
    backgroundColor: palette.gold,
    borderColor: palette.gold,
  },
  serviceModeLabel: {
    fontSize: 13,
    color: palette.charcoal,
  },
  serviceModeLabelSelected: {
    color: palette.pureWhite,
  },
  titleBlock: {
    gap: spacing.xs,
  },
  title: {
    fontSize: 18,
    color: palette.charcoal,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  timerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginLeft: 'auto',
  },
  timerText: {
    fontSize: 13,
    color: palette.gold,
  },
  rfqStatusChip: {
    alignSelf: 'flex-start',
    backgroundColor: palette.gold,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
  },
  rfqStatusChipMuted: {
    backgroundColor: palette.muted,
  },
  rfqStatusChipWarning: {
    backgroundColor: palette.goldDark,
  },
  rfqStatusChipSuccess: {
    backgroundColor: palette.gold,
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
  contactRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  messageButton: {
    flex: 1,
    minHeight: 44,
    borderRadius: radius.md,
    paddingVertical: 0,
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
  unitsEditor: {
    gap: spacing.md,
    paddingBottom: spacing.md,
  },
});
