import React from 'react';
import {
  ActivityIndicator,
  Image,
  Linking,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
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
import { useSharedNow } from '@/shared/hooks/useSharedNow';
import { SelectField } from '@/shared/components/SelectField';
import { EquipmentImageCarousel } from '@/features/listings/components/EquipmentImageCarousel';
import { EquipmentImageViewerModal } from '@/features/listings/components/EquipmentImageViewerModal';
import { EquipmentListingSummaryCard } from '@/features/listings/components/EquipmentListingSummaryCard';
import { AttachmentsSection } from '@/features/listings/components/AttachmentsSection';
import {
  listingsApi,
  isEquipmentListing,
  isGoldListing,
  isServiceListing,
} from '@/features/listings/api/listingsApi';
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
import { useLocalizedCatalogLabel } from '@/features/listings/utils/catalogLabels';
import { palette, radius, spacing } from '@/theme';
import { cardBackShadow } from '@/theme/cardShadow';

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
  const catalogLabel = useLocalizedCatalogLabel();
  const { currentLanguage } = useLanguage();
  const insets = useSafeAreaInsets();
  const currency = useCurrency();

  const profileId = useProfileStore((state) => state.profile?.id);
  const isAdmin = useProfileStore((state) => state.profile?.accountType === 'admin');
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
  const [detailsOpen, setDetailsOpen] = React.useState(false);
  const [selectedDuration, setSelectedDuration] = React.useState<RentalDuration | null>(null);
  const [messageOpen, setMessageOpen] = React.useState(false);
  const [messagePeer, setMessagePeer] = React.useState<{
    id: string;
    fullName: string;
    avatarUrl: string | null;
  } | null>(null);
  const [offerSubmitting, setOfferSubmitting] = React.useState(false);
  const [actingOfferId, setActingOfferId] = React.useState<string | null>(null);
  const [editingOfferId, setEditingOfferId] = React.useState<string | null>(null);
  const [editOfferPrice, setEditOfferPrice] = React.useState('');
  const [editOfferUnits, setEditOfferUnits] = React.useState(1);
  const [editOfferKind, setEditOfferKind] = React.useState<'rent' | 'sale'>('rent');
  const [editOfferHandover, setEditOfferHandover] = React.useState<'pickup' | 'delivery'>('pickup');
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
  let unitPriceCard: React.ReactNode = null;
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
      Boolean(profileId && (equipmentListing.ownerId ?? equipmentListing.owner?.id) === profileId);
    detailRows = [
      { label: t('common.reference'), value: equipmentListing.reference ?? '' },
      {
        label: t('equipmentListing.equipmentType'),
        value: catalogLabel('equipment', equipmentListing.equipmentTypeLabel),
      },
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
              value: formatListingDate(
                currentLanguage,
                equipmentListing.requestMode === 'auction'
                  ? (equipmentListing.auctionEndDate ?? equipmentListing.rfq?.expiresAt)
                  : equipmentListing.rfq?.expiresAt,
              ),
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

    if (offersSell && equipmentListing.salePrice && activeDuration) {
      detailRows.push({
        label: t('equipmentListing.salePrice'),
        value: `${currency.code} ${formatAmountWithCommas(equipmentListing.salePrice)}`,
      });
    }

    const rentPeriodLabel =
      activeDuration?.key === 'hourly'
        ? t('equipmentListing.perHour')
        : activeDuration?.key === 'weekly'
          ? t('equipmentListing.perWeek')
          : activeDuration?.key === 'monthly'
            ? t('equipmentListing.perMonth')
            : activeDuration?.key === 'yearly'
              ? t('equipmentListing.perYear')
              : '';
    const showSalePrice = offersSell && Boolean(equipmentListing.salePrice);
    const showRentPrice = Boolean(activeDuration);
    unitPriceCard =
      equipmentListing.postedAs === 'buyer' || (!showSalePrice && !showRentPrice) ? null : (
        <View style={styles.unitPriceCard}>
          {showSalePrice ? (
            <View style={styles.unitPriceCell}>
              <View style={styles.unitPriceHeading}>
                <Ionicons name="pricetag-outline" size={18} color={palette.charcoal} />
                <AppText style={styles.unitPriceCaption}>{t('equipmentListing.salePrice')}</AppText>
              </View>
              <AppText weight="bold" style={styles.unitPriceAmount}>
                {currency.code} {formatAmountWithCommas(equipmentListing.salePrice)}
              </AppText>
            </View>
          ) : null}
          {showSalePrice && showRentPrice ? <View style={styles.unitPriceDivider} /> : null}
          {showRentPrice && activeDuration ? (
            <View style={styles.unitPriceCell}>
              <View style={styles.unitPriceHeading}>
                <Ionicons name="key-outline" size={18} color={palette.charcoal} />
                <AppText style={styles.unitPriceCaption}>{t('equipmentListing.rentPrice')}</AppText>
              </View>
              <AppText weight="bold" style={styles.unitPriceAmount}>
                {currency.code} {formatAmountWithCommas(activeDuration.amount)}
              </AppText>
              {rentPeriodLabel ? (
                <AppText style={styles.unitPricePeriod}>{rentPeriodLabel}</AppText>
              ) : null}
              {durationOptions.length > 1 ? (
                <View style={styles.durationDropdown}>
                  <SelectField
                    placeholder={t('equipmentListing.durationPlaceholder')}
                    sheetTitle={t('equipmentListing.durationPlaceholder')}
                    options={durationOptions.map((option) => ({
                      value: option.key,
                      label: option.label,
                    }))}
                    value={activeDuration.key}
                    onChange={(next) => setSelectedDuration(next as RentalDuration)}
                    compact
                    dropdown
                  />
                </View>
              ) : null}
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
      {
        label: t('serviceListing.serviceCategory'),
        value: catalogLabel('services', serviceListing.serviceCategoryLabel),
      },
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
    unitPriceCard =
      serviceListing.postedAs === 'buyer' || servicePriceOptions.length === 0 ? null : (
        <View style={styles.unitPriceCard}>
          {servicePriceOptions.map((option, index) => (
            <React.Fragment key={option.key}>
              {index > 0 ? <View style={styles.unitPriceDivider} /> : null}
              <View style={styles.unitPriceCell}>
                <View style={styles.unitPriceHeading}>
                  <Ionicons
                    name={option.key === 'online' ? 'laptop-outline' : 'location-outline'}
                    size={18}
                    color={palette.charcoal}
                  />
                  <AppText style={styles.unitPriceCaption}>{option.label}</AppText>
                </View>
                <AppText weight="bold" style={styles.unitPriceAmount}>
                  {currency.code} {formatAmountWithCommas(option.amount)}
                </AppText>
              </View>
            </React.Fragment>
          ))}
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
      { label: t('goldListing.purity'), value: catalogLabel('gold', goldListing.purityLabel) },
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

    unitPriceCard =
      goldListing.postedAs === 'buyer' || !goldListing.price ? null : (
        <View style={styles.unitPriceCard}>
          <View style={styles.unitPriceCell}>
            <View style={styles.unitPriceHeading}>
              <Ionicons name="diamond-outline" size={18} color={palette.charcoal} />
              <AppText style={styles.unitPriceCaption}>{t('goldListing.startingPrice')}</AppText>
            </View>
            <AppText weight="bold" style={styles.unitPriceAmount}>
              {currency.code} {formatAmountWithCommas(goldListing.price)}
            </AppText>
          </View>
        </View>
      );

    extraSection = <AttachmentsSection documents={documents} />;
  }

  const visualMedia = [
    ...media.filter((item) => item.kind === 'photo').slice(0, 3),
    ...media.filter((item) => item.kind === 'video').slice(0, 1),
  ].map((item) => ({
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
  const hasSentOffer =
    Boolean(
      rfq?.myOfferStatus && ['active', 'selected', 'confirmed'].includes(rfq.myOfferStatus),
    ) || rfq?.status === 'offer-submitted';
  const isOwner = Boolean(ownerId && profileId && ownerId === profileId);
  const canEditListing = isOwner && !listingIsEngaged(rfq);
  const canOffer =
    !isAdmin &&
    Boolean(rfq) &&
    !isOwner &&
    (rfq?.canSubmitOffer ?? (!hasSentOffer && Boolean(postedAs)));
  const awaitingConfirm =
    rfq?.myOfferStatus === 'selected' ||
    rfq?.status === 'awaiting-your-confirmation' ||
    Boolean(rfq?.canConfirmOffer);
  const supplierBuyer =
    !isAdmin && !isOwner && category === 'equipment' && equipmentListing?.postedAs === 'supplier';
  const mySupplierOffers = supplierBuyer
    ? (rfq?.offers ?? []).filter((offer) => offer.responderId === profileId)
    : [];
  // Block the other rent/sale offer until this one is accepted (confirmed).
  // Set to false to allow both kinds again while one is still open.
  const limitToOneOpenOffer = true;
  const hasOpenSupplierOffer =
    limitToOneOpenOffer &&
    (mySupplierOffers.some((offer) => offer.status === 'active' || offer.status === 'selected') ||
      rfq?.myOfferStatus === 'active' ||
      rfq?.myOfferStatus === 'selected');
  const showOfferInput =
    !isAdmin &&
    (supplierBuyer
      ? unitsLeft > 0 && rfq?.canSubmitOffer !== false && !hasOpenSupplierOffer
      : !awaitingConfirm &&
        (canOffer || (category === 'gold' && hasSentOffer && rfq?.status === 'live')));
  const offerAcceptedBothSides =
    rfq?.myOfferStatus === 'confirmed' ||
    mySupplierOffers.some((offer) => offer.status === 'confirmed');
  const canMessage = !isAdmin && Boolean(owner) && !isOwner && offerAcceptedBothSides;
  const canWithdraw =
    !isAdmin &&
    !awaitingConfirm &&
    (Boolean(rfq?.canWithdrawOffer) ||
      rfq?.myOfferStatus === 'active' ||
      rfq?.status === 'offer-submitted');
  const showOwnerOffers = (isOwner || isAdmin) && Boolean(rfq);
  const isAuction = category === 'gold' || equipmentListing?.requestMode === 'auction';
  const showBidderLeaderboard =
    isAuction && !isOwner && !isAdmin && hasSentOffer && (rfq?.offers?.length ?? 0) > 0;
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
    handover?: 'pickup' | 'delivery',
  ) => {
    if (hasOpenSupplierOffer) return;
    const fulfillment = choice === 'rent' || choice === 'sale' ? choice : undefined;
    const delivery = choice === 'onsite' || choice === 'online' ? choice : undefined;
    setOfferSubmitting(true);
    void listingsApi
      .submitOffer(
        id,
        price,
        category === 'equipment' ? units : undefined,
        fulfillment,
        delivery,
        category === 'equipment' && equipmentListing?.postedAs === 'supplier' ? handover : undefined,
      )
      .then((listing) => {
        applyListing(listing);
      })
      .catch((error: unknown) => {
        const message = error instanceof ApiError ? error.message : t('rfq.offerFailed');
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
      const requested = rfq?.offers?.find((offer) => offer.id === offerId)?.quantity ?? 1;
      if (unitsLeft <= 0) {
        showAppAlert(t('rfq.noUnitsAvailable'));
        return;
      }
      if (requested > unitsLeft) {
        showAppAlert(t('rfq.lessUnitsAvailable'));
        return;
      }
    }
    const run = () => {
      setActingOfferId(offerId);
      const request = action === 'accept' ? listingsApi.acceptOffer : listingsApi.rejectOffer;
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

    if (action === 'accept') {
      showAppAlert(t('rfq.acceptConfirmTitle'), t('rfq.acceptConfirmMessage'), [
        { text: t('common.cancel'), style: 'cancel' },
        { text: t('rfq.accept'), onPress: run },
      ]);
      return;
    }

    showAppAlert(t('rfq.rejectConfirmTitle'), t('rfq.rejectConfirmMessage'), [
      { text: t('common.cancel'), style: 'cancel' },
      { text: t('rfq.reject'), style: 'destructive', onPress: run },
    ]);
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

    if (action === 'confirm') {
      showAppAlert(t('rfq.confirmOfferTitle'), t('rfq.confirmOfferMessage'), [
        { text: t('common.cancel'), style: 'cancel' },
        { text: t('rfq.confirm'), onPress: run },
      ]);
      return;
    }

    run();
  };

  const beginEditOffer = (offer: {
    id: string;
    price?: string;
    quantity?: number | null;
    kind?: 'rent' | 'sale';
    handover?: 'pickup' | 'delivery';
  }) => {
    const units = offer.quantity != null && offer.quantity > 0 ? offer.quantity : 1;
    const total = Number(offer.price);
    const unitPrice =
      Number.isFinite(total) && total > 0 ? Math.round((total / units) * 100) / 100 : '';
    setEditingOfferId(offer.id);
    setEditOfferUnits(units);
    setEditOfferPrice(unitPrice === '' ? '' : String(unitPrice));
    setEditOfferKind(offer.kind === 'sale' ? 'sale' : 'rent');
    setEditOfferHandover(offer.handover === 'delivery' ? 'delivery' : 'pickup');
  };

  const handleSaveOffer = (offerId: string) => {
    const price = editOfferPrice.trim();
    if (!/^\d+(\.\d{1,2})?$/.test(price) || Number(price) <= 0) return;
    showAppAlert(t('rfq.updateConfirmTitle'), t('rfq.updateConfirmMessage'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('rfq.update'),
        onPress: () => {
          setOfferSubmitting(true);
          void listingsApi
            .updateOffer(
              id,
              offerId,
              price,
              editOfferUnits,
              equipmentListing?.mode === 'both' ? editOfferKind : undefined,
              equipmentListing?.deliveryAvailable ? editOfferHandover : 'pickup',
            )
            .then((listing) => {
              applyListing(listing);
              setEditingOfferId(null);
            })
            .catch((error: unknown) => {
              const message = error instanceof ApiError ? error.message : t('rfq.actionFailed');
              showAppAlert(t('common.error'), message);
            })
            .finally(() => setOfferSubmitting(false));
        },
      },
    ]);
  };

  return (
    <View style={styles.root}>
      <StatusBar style="light" />

      <KeyboardAwareScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        bottomOffset={96}
        extraKeyboardSpace={0}
        disableScrollOnKeyboardHide
      >
        <EquipmentImageCarousel
          media={visualMedia}
          onPressImage={setViewerIndex}
          placeholderIcon={
            category === 'services'
              ? 'briefcase-outline'
              : category === 'gold'
                ? 'diamond-outline'
                : 'construct-outline'
          }
          style={styles.carousel}
          statusBadge={
            headerBadge ? (
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
            ) : null
          }
        />

        <View style={styles.content}>
          <View style={styles.headerBlock}>
            {showCountdown ? (
              <View style={styles.statusRow}>
                <View style={styles.timerBadge}>
                  <Ionicons name="time-outline" size={12} color={palette.gold} />
                  <AppText weight="semibold" style={styles.timerText}>
                    {timeLeft}
                  </AppText>
                </View>
              </View>
            ) : null}

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

          {unitPriceCard}

          {detailRows.length > 0 ||
          descriptionText ||
          (isOwner && equipmentListing?.postedAs === 'supplier') ? (
            <View style={styles.viewDetailsRow}>
              {detailRows.length > 0 || descriptionText ? (
                <Pressable
                  onPress={() => setDetailsOpen(true)}
                  accessibilityRole="button"
                  accessibilityLabel={t('common.viewDetails')}
                  style={({ pressed }) => [
                    styles.viewDetailsButton,
                    styles.viewDetailsButtonInRow,
                    pressed && styles.viewDetailsPressed,
                  ]}
                >
                  <View style={styles.viewDetailsIcon}>
                    <Ionicons name="document-text-outline" size={18} color={palette.gold} />
                  </View>
                  <View style={styles.viewDetailsCopy}>
                    <AppText weight="semibold" style={styles.viewDetailsLabel} numberOfLines={1}>
                      {t('common.viewDetails')}
                    </AppText>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color={palette.muted} />
                </Pressable>
              ) : null}

              {isOwner && equipmentListing?.postedAs === 'supplier' ? (
                <Pressable
                  onPress={() => navigation.navigate('EquipmentStock', { id })}
                  accessibilityRole="button"
                  accessibilityLabel={t('equipmentListing.viewUnitDetails')}
                  style={({ pressed }) => [
                    styles.viewDetailsButton,
                    styles.viewDetailsButtonInRow,
                    pressed && styles.viewDetailsPressed,
                  ]}
                >
                  <View style={styles.viewDetailsIcon}>
                    <Ionicons name="cube-outline" size={18} color={palette.gold} />
                  </View>
                  <View style={styles.viewDetailsCopy}>
                    <AppText weight="semibold" style={styles.viewDetailsLabel} numberOfLines={1}>
                      {t('equipmentListing.viewUnitDetails')}
                    </AppText>
                    <AppText style={styles.viewDetailsHint} numberOfLines={1}>
                      {t('equipmentListing.viewUnitDetailsHint')}
                    </AppText>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color={palette.muted} />
                </Pressable>
              ) : null}
            </View>
          ) : null}

          {extraSection}

          {isAdmin && owner ? (
            <View style={styles.creatorBlock}>
              <AppText weight="semibold" style={styles.creatorLabel}>
                {t('admin.createdBy')}
              </AppText>
              <Pressable
                onPress={() => navigation.navigate('AdminUserProfile', { userId: owner.id })}
                style={styles.creatorCard}
              >
                {owner.avatarUrl ? (
                  <Image source={{ uri: owner.avatarUrl }} style={styles.creatorAvatar} />
                ) : (
                  <View style={styles.creatorAvatarFallback}>
                    <AppText weight="semibold" style={styles.creatorInitial}>
                      {owner.fullName.trim().charAt(0).toUpperCase() || '?'}
                    </AppText>
                  </View>
                )}
                <AppText weight="semibold" style={styles.creatorName} numberOfLines={1}>
                  {owner.fullName}
                </AppText>
              </Pressable>
            </View>
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
              canDecideOffers={!isAdmin && rfq?.canDecideOffers !== false}
              rfqStatus={rfq?.status}
              showUnits={category === 'equipment'}
              placeholderIcon={
                category === 'gold'
                  ? 'diamond-outline'
                  : equipmentListing?.requestMode === 'auction'
                    ? 'construct-outline'
                    : undefined
              }
              showLeader={category === 'gold' || equipmentListing?.requestMode === 'auction'}
              onAccept={(offerId) => handleDecideOffer(offerId, 'accept')}
              onReject={(offerId) => handleDecideOffer(offerId, 'reject')}
              onPressResponder={
                isAdmin
                  ? (offer) =>
                      navigation.navigate('AdminUserProfile', { userId: offer.responderId })
                  : undefined
              }
              onMessage={
                isAdmin
                  ? undefined
                  : (offer) => {
                      setMessagePeer({
                        id: offer.responderId,
                        fullName: offer.responderName,
                        avatarUrl: null,
                      });
                      setMessageOpen(true);
                    }
              }
            />
          ) : null}

          {showBidderLeaderboard ? (
            <ListingOffersPanel
              offers={rfq?.offers ?? []}
              currencyCode={currency.code}
              actingOfferId={null}
              canDecideOffers={false}
              rfqStatus={rfq?.status}
              showUnits={category === 'equipment'}
              placeholderIcon={
                category === 'gold' ? 'diamond-outline' : 'construct-outline'
              }
              showLeader
              compact
              title={t('rfq.leaderboardTitle')}
              onAccept={() => undefined}
              onReject={() => undefined}
              contactResponderId={profileId}
              contactPhone={rfq?.ownerPhone}
              onMessage={profileId ? () => setMessageOpen(true) : undefined}
            />
          ) : null}

          {supplierBuyer && mySupplierOffers.length > 0 ? (
            <View style={styles.myOffers}>
              <AppText weight="bold" style={styles.myOffersTitle}>
                {t('rfq.yourOffer')}
              </AppText>
              {mySupplierOffers.map((offer) => (
                <View key={offer.id} style={[styles.myOfferCard, cardBackShadow]}>
                  <View style={styles.myOfferRow}>
                    <AppText weight="semibold" style={styles.myOfferUnits} numberOfLines={1}>
                      {t('rfq.yourOffer')}
                    </AppText>
                    <View style={styles.myOfferBadges}>
                      {offer.status === 'selected' || offer.status === 'confirmed' ? (
                        <View style={styles.myOfferStatusBadge}>
                          <AppText weight="semibold" style={styles.myOfferStatusText}>
                            {t(
                              `rfq.offerStatus.${
                                offer.status === 'selected' ? 'selected' : 'confirmed'
                              }`,
                            )}
                          </AppText>
                        </View>
                      ) : null}
                      {offer.handover === 'delivery' ? (
                        <View style={styles.myOfferKindBadge}>
                          <AppText weight="semibold" style={styles.myOfferKindText}>
                            {t('equipmentListing.deliveryBadge')}
                          </AppText>
                        </View>
                      ) : null}
                      <View style={styles.myOfferKindBadge}>
                        <AppText weight="semibold" style={styles.myOfferKindText}>
                          {offer.kind === 'sale'
                            ? t('equipmentListing.buy')
                            : t('equipmentListing.rent')}
                        </AppText>
                      </View>
                    </View>
                  </View>
                  {offer.createdAt ? (
                    <AppText style={styles.myOfferDate} numberOfLines={1}>
                      {new Intl.DateTimeFormat(appI18n.language, { dateStyle: 'medium', timeStyle: 'short' }).format(
                        new Date(offer.createdAt),
                      )}
                    </AppText>
                  ) : null}
                  {offer.price ? (
                    <View style={styles.myOfferPriceRow}>
                      <AppText weight="bold" style={styles.myOfferPrice} numberOfLines={1}>
                        {currency.code} {formatAmountWithCommas(offer.price)}
                      </AppText>
                      {offer.quantity ? (
                        <AppText weight="semibold" style={styles.myOfferPerUnit} numberOfLines={1}>
                          {t('equipmentListing.unitsCount', { count: offer.quantity })}
                        </AppText>
                      ) : null}
                    </View>
                  ) : null}
                  {offer.status === 'active' && editingOfferId === offer.id ? (
                    <View style={styles.myOfferEdit}>
                      {equipmentListing?.mode === 'both' ? (
                        <View style={styles.editChoiceRow}>
                          {(['rent', 'sale'] as const).map((kind) => {
                            const selected = editOfferKind === kind;
                            return (
                              <Pressable
                                key={kind}
                                onPress={() => setEditOfferKind(kind)}
                                style={[styles.editChoice, selected && styles.editChoiceSelected]}
                              >
                                <AppText
                                  weight="semibold"
                                  style={[
                                    styles.editChoiceLabel,
                                    selected && styles.editChoiceLabelSelected,
                                  ]}
                                >
                                  {kind === 'rent'
                                    ? t('equipmentListing.rent')
                                    : t('equipmentListing.buy')}
                                </AppText>
                              </Pressable>
                            );
                          })}
                        </View>
                      ) : null}
                      {equipmentListing?.deliveryAvailable ? (
                        <View style={styles.editChoiceRow}>
                          {(['delivery', 'pickup'] as const).map((mode) => {
                            const selected = editOfferHandover === mode;
                            return (
                              <Pressable
                                key={mode}
                                onPress={() => setEditOfferHandover(mode)}
                                accessibilityRole="radio"
                                accessibilityState={{ selected }}
                                style={[styles.editHandoverOption, selected && styles.editHandoverOptionSelected]}
                              >
                                <View style={[styles.editRadio, selected && styles.editRadioSelected]}>
                                  {selected ? <View style={styles.editRadioDot} /> : null}
                                </View>
                                <Ionicons
                                  name={mode === 'delivery' ? 'car-outline' : 'storefront-outline'}
                                  size={18}
                                  color={selected ? palette.gold : palette.muted}
                                />
                                <AppText
                                  weight={selected ? 'semibold' : 'regular'}
                                  numberOfLines={1}
                                  style={styles.editHandoverLabel}
                                >
                                  {mode === 'delivery'
                                    ? t('equipmentListing.deliveryBadge')
                                    : t('equipmentListing.pickup')}
                                </AppText>
                              </Pressable>
                            );
                          })}
                        </View>
                      ) : null}
                      <TextInput
                        value={editOfferPrice}
                        onChangeText={setEditOfferPrice}
                        keyboardType="decimal-pad"
                        placeholder={t('rfq.unitPricePlaceholder', { currency: currency.code })}
                        placeholderTextColor={palette.muted}
                        style={styles.myOfferPriceInput}
                      />
                      <CounterField
                        label={t('rfq.unitsLabel')}
                        value={editOfferUnits}
                        min={1}
                        max={Math.max(unitsLeft, offer.quantity ?? 1)}
                        onChange={setEditOfferUnits}
                      />
                      <View style={styles.myOfferActions}>
                        <Button
                          label={t('common.cancel')}
                          variant="outline"
                          onPress={() =>
                            showAppAlert(t('rfq.discardEditTitle'), t('rfq.discardEditMessage'), [
                              { text: t('common.cancel'), style: 'cancel' },
                              {
                                text: t('rfq.discardEdit'),
                                style: 'destructive',
                                onPress: () => setEditingOfferId(null),
                              },
                            ])
                          }
                          style={styles.myOfferAction}
                        />
                        <Button
                          label={t('common.save')}
                          loading={offerSubmitting}
                          onPress={() => handleSaveOffer(offer.id)}
                          style={styles.myOfferAction}
                        />
                      </View>
                    </View>
                  ) : null}
                  {offer.status === 'active' && editingOfferId !== offer.id ? (
                    <View style={styles.myOfferActions}>
                      <Button
                        label={t('rfq.update')}
                        variant="outline"
                        onPress={() => beginEditOffer(offer)}
                        style={styles.myOfferAction}
                      />
                      <Button
                        label={t('rfq.withdraw')}
                        variant="outline"
                        onPress={() => handleResponderOffer('withdraw', offer.id)}
                        style={styles.myOfferAction}
                      />
                    </View>
                  ) : null}
                  {offer.status === 'confirmed' ? (
                    <View style={styles.myOfferActions}>
                      <Button
                        label={t('messages.message')}
                        icon="chatbubble-ellipses-outline"
                        onPress={() => setMessageOpen(true)}
                        style={styles.myOfferAction}
                      />
                      {rfq?.ownerPhone ? (
                        <Button
                          label={t('common.whatsapp')}
                          icon="logo-whatsapp"
                          variant="whatsapp"
                          onPress={() => openWhatsApp(rfq.ownerPhone!)}
                          style={styles.myOfferAction}
                        />
                      ) : null}
                    </View>
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

          {(isOwner || isAdmin) && equipmentListing?.postedAs === 'supplier' ? (
            <EquipmentDealsSection
              listingId={id}
              revision={(rfq?.offers ?? []).map((offer) => `${offer.id}:${offer.status}`).join('|')}
              buyerPhones={Object.fromEntries(
                (rfq?.offers ?? [])
                  .filter((offer) => offer.responderPhone)
                  .map((offer) => [offer.responderId, offer.responderPhone as string]),
              )}
              onMessageBuyer={
                isAdmin
                  ? undefined
                  : (buyer) => {
                      setMessagePeer({ id: buyer.id, fullName: buyer.fullName, avatarUrl: null });
                      setMessageOpen(true);
                    }
              }
              onPressBuyer={
                isAdmin
                  ? (buyerId) => navigation.navigate('AdminUserProfile', { userId: buyerId })
                  : undefined
              }
            />
          ) : null}
        </View>
      </KeyboardAwareScrollView>

      {backButton}

      {canEditListing ? (
        <Pressable
          onPress={() => {
            if (category === 'equipment') {
              navigation.navigate('EquipmentListingForm', { editId: id });
            } else if (category === 'services') {
              navigation.navigate('ServiceListingForm', { editId: id });
            } else {
              navigation.navigate('GoldListingForm', { editId: id });
            }
          }}
          disabled={deletingListing}
          hitSlop={12}
          style={[
            styles.overlayButton,
            styles.editButton,
            { top: insets.top + spacing.sm },
            deletingListing && styles.withdrawDisabled,
          ]}
          accessibilityRole="button"
          accessibilityLabel={t('common.edit')}
        >
          <Ionicons name="create-outline" size={18} color={palette.pureWhite} />
        </Pressable>
      ) : null}

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
                            useGoldListingsStore
                              .getState()
                              .listings.filter((item) => item.id !== id),
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
                        const message =
                          error instanceof ApiError ? error.message : t('common.error');
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

      {(supplierBuyer
        ? showOfferInput || offerAcceptedBothSides
        : showOfferInput || hasSentOffer) ? (
        <ListingOfferComposer
          currencyCode={currency.code}
          placeholder={
            category === 'gold' && hasSentOffer
              ? t('rfq.updateOfferPlaceholder', { currency: currency.code })
              : t('rfq.offerPlaceholder', { currency: currency.code })
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
            category === 'equipment'
              ? t('rfq.unitPricePlaceholder', { currency: currency.code })
              : undefined
          }
          maxUnits={category === 'equipment' ? Math.max(unitsLeft, 0) : undefined}
          offerTypeLabel={
            (category === 'equipment' && equipmentListing?.postedAs === 'supplier') ||
            (category === 'services' && serviceListing?.serviceType === 'both')
              ? t('rfq.offerType')
              : undefined
          }
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
          handoverModes={
            category === 'equipment' && equipmentListing?.postedAs === 'supplier'
              ? equipmentListing.deliveryAvailable
                ? ['delivery', 'pickup']
                : ['pickup']
              : undefined
          }
          handoverLabels={{
            pickup: t('equipmentListing.pickup'),
            delivery: t('equipmentListing.deliveryBadge'),
          }}
          handoverTitle={t('equipmentListing.deliveryPreference')}
          blockedFulfillmentModes={
            supplierBuyer
              ? hasOpenSupplierOffer
                ? (['rent', 'sale'] as const)
                : (['rent', 'sale'] as const).filter((kind) =>
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
                {rfq?.ownerPhone ? (
                  <Button
                    label={t('common.whatsapp')}
                    icon="logo-whatsapp"
                    variant="whatsapp"
                    onPress={() => openWhatsApp(rfq.ownerPhone!)}
                    style={styles.messageButton}
                  />
                ) : null}
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

      <AppBottomSheet visible={detailsOpen} onClose={() => setDetailsOpen(false)} fitContent>
        <EquipmentListingSummaryCard
          detailRows={detailRows}
          media={[]}
          hideMedia
          description={descriptionText}
          plain
        />
      </AppBottomSheet>

      <EquipmentImageViewerModal
        visible={viewerIndex !== null}
        media={visualMedia}
        initialIndex={viewerIndex ?? 0}
        onClose={() => setViewerIndex(null)}
      />
    </View>
  );
}

const ENGAGED_LISTING_STATUSES = new Set([
  'awaiting-confirmation',
  'awaiting-your-confirmation',
  'awaiting-action',
]);

/** True while an offer is still open or waiting to be confirmed. Confirmed and completed listings can be edited again. */
function listingIsEngaged(
  rfq: { status?: string; offers?: { status: string }[] } | undefined,
): boolean {
  if (!rfq) return false;
  if (rfq.status === 'confirmed' || rfq.status === 'completed') return false;
  if (ENGAGED_LISTING_STATUSES.has(rfq.status ?? '')) return true;
  return (rfq.offers ?? []).some(
    (offer) => offer.status === 'active' || offer.status === 'selected',
  );
}

function supplierUnitsLeft(id: string, sources: Array<ListingDto | null | undefined>): number {
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
  const ahead = endsAt == null ? HOUR_MS : Math.max(0, endsAt - Date.now());
  const tickMs = ahead >= HOUR_MS ? 60_000 : ahead >= MINUTE_MS ? 15_000 : 1000;
  const now = useSharedNow(tickMs);

  if (endsAt == null) return null;
  const remainingMs = Math.max(0, endsAt - now);
  if (remainingMs > DAY_MS) return `${Math.floor(remainingMs / DAY_MS)}d`;
  if (remainingMs >= HOUR_MS) return `${Math.floor(remainingMs / HOUR_MS)}h`;
  if (remainingMs >= MINUTE_MS) return `${Math.floor(remainingMs / MINUTE_MS)}m`;
  return `${Math.floor(remainingMs / 1000)}s`;
}

const styles = StyleSheet.create({
  creatorBlock: { gap: spacing.xs, marginBottom: spacing.sm },
  creatorLabel: { fontSize: 16, color: palette.charcoal },
  creatorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: palette.warmWhite,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: palette.softGold,
    padding: spacing.sm,
  },
  creatorAvatar: { width: 40, height: 40, borderRadius: 20 },
  creatorAvatarFallback: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.softGold,
  },
  creatorInitial: { color: palette.goldDark, fontSize: 16 },
  creatorName: { flex: 1, fontSize: 16, color: palette.charcoal },
  root: {
    flex: 1,
    backgroundColor: palette.pureWhite,
  },
  scroll: {
    flex: 1,
  },
  content: {
    padding: spacing.lg,
    paddingTop: spacing.md,
    gap: spacing.md - 2,
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
  editButton: {
    right: spacing.md + 40 + spacing.sm,
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
  myOffers: { gap: spacing.xs },
  myOffersTitle: { fontSize: 16, color: palette.charcoal },
  myOfferCard: {
    backgroundColor: palette.warmWhite,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: palette.softGold,
    padding: spacing.md,
    gap: spacing.xs,
  },
  myOfferRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  myOfferBadges: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  myOfferKindBadge: {
    backgroundColor: palette.softGold,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
  },
  myOfferKindText: { fontSize: 11, color: palette.goldDark },
  myOfferStatusBadge: {
    backgroundColor: palette.lightGold,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
  },
  myOfferStatusText: { fontSize: 11, color: palette.charcoal },
  myOfferUnits: { flex: 1, fontSize: 13, color: palette.muted },
  myOfferDate: { fontSize: 12, color: palette.muted },
  myOfferPriceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  myOfferPrice: { flex: 1, fontSize: 22, color: palette.charcoal },
  myOfferPerUnit: { fontSize: 16, color: palette.muted },
  myOfferActions: { flexDirection: 'row', gap: spacing.sm },
  myOfferAction: {
    flex: 1,
    minHeight: 36,
    paddingVertical: 6,
    paddingHorizontal: spacing.md,
  },
  myOfferEdit: { gap: spacing.xs },
  editChoiceRow: { flexDirection: 'row', gap: spacing.xs },
  editChoice: {
    flex: 1,
    minHeight: 36,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: palette.softGold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editChoiceSelected: { backgroundColor: palette.gold, borderColor: palette.gold },
  editChoiceLabel: { fontSize: 13, color: palette.charcoal },
  editChoiceLabelSelected: { color: palette.pureWhite },
  editHandoverOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    minHeight: 44,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: '#E7E1D6',
    backgroundColor: palette.warmWhite,
  },
  editHandoverOptionSelected: {
    borderColor: palette.gold,
    backgroundColor: '#FFF9EE',
  },
  editHandoverLabel: { flex: 1, fontSize: 14, color: palette.charcoal },
  editRadio: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: palette.muted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editRadioSelected: { borderColor: palette.gold },
  editRadioDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: palette.gold },
  myOfferPriceInput: {
    borderWidth: 1,
    borderColor: palette.softGold,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: 16,
    color: palette.charcoal,
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
    fontSize: 26,
    color: palette.charcoal,
  },
  unitPriceCard: {
    flexDirection: 'row',
    alignItems: 'stretch',
    backgroundColor: palette.warmWhite,
    borderRadius: radius.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
  },
  unitPriceCell: {
    flex: 1,
    gap: 2,
    paddingHorizontal: spacing.sm,
  },
  unitPriceHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  unitPriceCaption: {
    fontSize: 13,
    color: palette.charcoal,
  },
  unitPriceAmount: {
    fontSize: 20,
    color: palette.charcoal,
    marginLeft: 18 + spacing.xs,
  },
  unitPricePeriod: {
    fontSize: 13,
    color: palette.muted,
    marginLeft: 18 + spacing.xs,
  },
  unitPriceDivider: {
    width: StyleSheet.hairlineWidth,
    backgroundColor: palette.softGold,
    marginVertical: spacing.xs,
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
  viewDetailsRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: spacing.sm,
  },
  viewDetailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: palette.warmWhite,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: palette.softGold,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    minHeight: 52,
    minWidth: 0,
  },
  viewDetailsButtonInRow: {
    flex: 1,
    flexBasis: 0,
  },
  viewDetailsPressed: {
    opacity: 0.75,
  },
  viewDetailsIcon: {
    width: 28,
    height: 28,
    borderRadius: radius.sm,
    backgroundColor: palette.softGold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewDetailsCopy: {
    flex: 1,
    minWidth: 0,
    gap: 1,
  },
  viewDetailsLabel: {
    fontSize: 13,
    color: palette.charcoal,
  },
  viewDetailsHint: {
    fontSize: 12,
    color: palette.muted,
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
