import React from 'react';
import { StyleSheet, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { i18n as appI18n } from '@/i18n';
import type { EquipmentListingMode, RootStackParamList } from '@/navigation/types';
import { AppText } from '@/shared/components/AppText';
import { AppTopBar } from '@/shared/components/AppTopBar';
import { FormInput } from '@/shared/components/FormInput';
import { SelectField } from '@/shared/components/SelectField';
import { DateTimeField } from '@/shared/components/DateTimeField';
import {
  DurationSlider,
  formatAuctionDurationLabel,
} from '@/features/listings/components/DurationSlider';
import { useCatalogOptions } from '@/features/listings/utils/useCatalogOptions';
import {
  clampAuctionHours,
  defaultListingEnd,
  expiryHoursUntil,
} from '@/features/listings/utils/listingExpiry';
import { CounterField } from '@/shared/components/CounterField';
import { LocationField } from '@/shared/components/LocationField';
import { useAutoCurrentLocation } from '@/shared/hooks/useAutoCurrentLocation';
import { useLocationMapPicker } from '@/shared/hooks/useLocationMapPicker';
import { ToggleRow } from '@/shared/components/ToggleRow';
import { SegmentedSwitcher } from '@/shared/components/SegmentedSwitcher';
import { Button } from '@/shared/components/Button';
import { OptionRowCard } from '@/shared/components/OptionRowCard';
import { OfferChoiceCard } from '@/features/listings/components/OfferChoiceCard';
import { ListingStepper } from '@/features/listings/components/ListingStepper';
import { EquipmentMediaUploader } from '@/features/listings/components/EquipmentMediaUploader';
import { EquipmentListingReview } from '@/features/listings/components/EquipmentListingReview';
import { palette, radius, spacing } from '@/theme';
import { showAppAlert } from '@/shared/services/appAlert';
import { ApiError } from '@/shared/services/api';
import { listingsApi, isEquipmentListing } from '@/features/listings/api/listingsApi';
import { cacheListing } from '@/features/listings/utils/refreshListings';
import { persistListingMedia } from '@/features/listings/utils/persistListingMedia';
import { matchSelectOption, cloneRepostMedia } from '@/features/listings/utils/matchSelectOption';
import { useListingsStore } from '@/store/listingsStore';
import { useMarketplaceRoleStore } from '@/store/marketplaceRoleStore';
import { useCurrency } from '@/shared/hooks/useCurrency';
import { useLanguage } from '@/i18n/hooks/useLanguage';
import {
  formatAmountWithCommas,
  parsePositiveAmount,
  sanitizeStepPrice,
} from '@/shared/utils/formatAmount';
import {
  LISTING_DESCRIPTION_MAX_LENGTH,
  LISTING_TITLE_MAX_LENGTH,
} from '@/features/listings/constants/listingFieldLimits';
import type { EquipmentMediaAsset } from '@/features/listings/types/equipmentMedia.types';
import type {
  DeliveryType,
  EquipmentListing,
} from '@/features/listings/types/equipmentListing.types';

type Props = NativeStackScreenProps<RootStackParamList, 'EquipmentListingForm'>;

type RentPeriod = 'hourly' | 'weekly' | 'monthly' | 'yearly';

function rentPeriodFromListing(listing: {
  hourlyRental?: string;
  weeklyRental?: string;
  monthlyRental?: string;
  yearlyRental?: string;
}): RentPeriod | null {
  if (listing.hourlyRental?.trim()) return 'hourly';
  if (listing.weeklyRental?.trim()) return 'weekly';
  if (listing.monthlyRental?.trim()) return 'monthly';
  if (listing.yearlyRental?.trim()) return 'yearly';
  return null;
}

export function EquipmentListingFormScreen({ navigation, route }: Props): React.ReactElement {
  const { t } = useTranslation(undefined, { i18n: appI18n });
  const { currentLanguage } = useLanguage();
  const currency = useCurrency();
  const editingId = route.params?.editId;
  const sourceId = editingId ?? route.params?.repostId;
  const roleIsBuyer = useMarketplaceRoleStore((state) => state.role === 'buyer');
  const [requestMode, setRequestMode] = React.useState<'rfq' | 'auction'>('rfq');
  const [offerRent, setOfferRent] = React.useState(false);
  const [offerSell, setOfferSell] = React.useState(false);
  const mode = offerRent && offerSell ? 'both' : offerRent ? 'rent' : offerSell ? 'sell' : null;

  const steps = [
    { key: 'offer', label: t('equipmentListing.offerStep') },
    { key: 'details', label: t('equipmentListing.detailsStep') },
    { key: 'media', label: t('equipmentListing.mediaStep') },
    { key: 'review', label: t('equipmentListing.reviewStep') },
  ];
  const lastStep = steps.length - 1;
  const [step, setStep] = React.useState(0);
  const [publishing, setPublishing] = React.useState(false);
  const addListing = useListingsStore((state) => state.addListing);
  const repostListing = useListingsStore((state) =>
    sourceId ? state.listings.find((item) => item.id === sourceId) : undefined,
  );
  const filledRepost = React.useRef(false);
  const originalListedUntil = React.useRef<number | null>(null);
  const [fetchedRepost, setFetchedRepost] = React.useState<EquipmentListing | undefined>(undefined);
  const sourceListing = repostListing ?? fetchedRepost;
  const isBuyer = editingId ? sourceListing?.postedAs === 'buyer' : roleIsBuyer;

  const equipmentTypeOptions = useCatalogOptions('equipment');

  const [equipmentType, setEquipmentType] = React.useState<string | null>(null);
  const [title, setTitle] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [rentPeriod, setRentPeriod] = React.useState<RentPeriod | null>(null);
  const [rentalAmount, setRentalAmount] = React.useState('');
  const [salePrice, setSalePrice] = React.useState('');
  const [units, setUnits] = React.useState(1);
  const [location, setLocation] = React.useState('');
  const [listedUntil, setListedUntil] = React.useState(defaultListingEnd);
  const [auctionStartDate, setAuctionStartDate] = React.useState<Date | null>(() => new Date());
  const [durationHours, setDurationHours] = React.useState(24);
  const [locationCoords, setLocationCoords] = React.useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [media, setMedia] = React.useState<EquipmentMediaAsset[]>([]);
  const [mediaBusy, setMediaBusy] = React.useState(false);
  const [deliveryAvailable, setDeliveryAvailable] = React.useState(false);
  const [deliveryType, setDeliveryType] = React.useState<DeliveryType>('free');
  const [deliveryPricePerKm, setDeliveryPricePerKm] = React.useState('');
  const { locationLoading, getCurrentLocation, openMapPickerForSelection, mapPickerSheet } =
    useLocationMapPicker();

  React.useEffect(() => {
    const id = sourceId;
    if (!id || repostListing) return;
    let cancelled = false;
    void listingsApi.get(id).then((listing) => {
      if (!cancelled && isEquipmentListing(listing)) setFetchedRepost(listing);
    });
    return () => {
      cancelled = true;
    };
  }, [repostListing, sourceId]);

  React.useEffect(() => {
    if (!sourceListing || filledRepost.current) return;
    filledRepost.current = true;
    const period = isBuyer ? null : rentPeriodFromListing(sourceListing);
    setOfferRent(!isBuyer && (sourceListing.mode === 'rent' || sourceListing.mode === 'both'));
    setOfferSell(isBuyer || sourceListing.mode === 'sell' || sourceListing.mode === 'both');
    setEquipmentType(
      matchSelectOption(equipmentTypeOptions, sourceListing.equipmentTypeLabel) ??
        (sourceListing.equipmentTypeLabel.trim() || null),
    );
    setTitle(sourceListing.title.slice(0, LISTING_TITLE_MAX_LENGTH));
    setDescription((sourceListing.description ?? '').slice(0, LISTING_DESCRIPTION_MAX_LENGTH));
    setRentPeriod(period);
    setRentalAmount(
      isBuyer
        ? ''
        : period === 'hourly'
          ? (sourceListing.hourlyRental ?? '')
          : period === 'weekly'
            ? (sourceListing.weeklyRental ?? '')
            : period === 'monthly'
              ? (sourceListing.monthlyRental ?? '')
              : period === 'yearly'
                ? (sourceListing.yearlyRental ?? '')
                : '',
    );
    setSalePrice(isBuyer ? '' : (sourceListing.salePrice ?? ''));
    setUnits(Math.max(sourceListing.units ?? 1, 1));
    if (sourceListing.requestMode === 'auction' || sourceListing.requestMode === 'rfq') {
      setRequestMode(sourceListing.requestMode);
    }
    setLocation(sourceListing.location ?? '');
    setMedia(
      cloneRepostMedia(
        (sourceListing.media ?? []).filter(
          (item): item is EquipmentMediaAsset => item.kind === 'photo' || item.kind === 'video',
        ),
      ),
    );
    setDeliveryAvailable(Boolean(sourceListing.deliveryAvailable));
    setDeliveryType(sourceListing.deliveryType ?? 'free');
    setDeliveryPricePerKm(sourceListing.deliveryPricePerKm ?? '');
    if (editingId) {
      const until = sourceListing.rfq?.expiresAt ?? null;
      if (until) {
        originalListedUntil.current = until;
        setListedUntil(new Date(until));
      }
      const end = sourceListing.auctionEndDate ?? sourceListing.rfq?.expiresAt ?? null;
      const start = sourceListing.auctionStartDate ?? null;
      if (start && end && end > start) {
        setAuctionStartDate(new Date(start));
        setDurationHours(clampAuctionHours((end - start) / 3_600_000));
      } else if (end && end > Date.now()) {
        setAuctionStartDate(new Date());
        setDurationHours(clampAuctionHours((end - Date.now()) / 3_600_000));
      }
    }
  }, [editingId, equipmentTypeOptions, isBuyer, sourceListing]);

  React.useEffect(() => {
    if (!sourceListing || equipmentTypeOptions.length === 0) return;
    const matched = matchSelectOption(equipmentTypeOptions, sourceListing.equipmentTypeLabel);
    if (matched) setEquipmentType(matched);
  }, [equipmentTypeOptions, sourceListing]);

  const handleUseCurrentLocation = React.useCallback(async () => {
    const selection = await getCurrentLocation();
    if (!selection) return;
    setLocation(selection.label);
    setLocationCoords({ latitude: selection.latitude, longitude: selection.longitude });
  }, [getCurrentLocation]);

  useAutoCurrentLocation(step === 2, location.trim().length > 0, handleUseCurrentLocation);

  const handleSelectOnMap = () => {
    openMapPickerForSelection((selection) => {
      setLocation(selection.label);
      setLocationCoords({ latitude: selection.latitude, longitude: selection.longitude });
    }, locationCoords);
  };

  const detailsValid = Boolean(
    mode &&
    equipmentType &&
    title.trim() &&
    units > 0 &&
    (isBuyer ||
      ((offerRent ? Boolean(rentPeriod && parsePositiveAmount(rentalAmount)) : true) &&
        (offerSell ? Boolean(parsePositiveAmount(salePrice)) : true))),
  );
  const deliveryValid =
    isBuyer ||
    !deliveryAvailable ||
    deliveryType === 'free' ||
    Boolean(parsePositiveAmount(deliveryPricePerKm));
  const mediaValid =
    (isBuyer || media.length > 0) &&
    !mediaBusy &&
    location.trim().length > 0 &&
    deliveryValid &&
    (!isBuyer || requestMode !== 'auction' || auctionStartDate != null);
  const canGoNext = step === 0 ? Boolean(mode) : step === 1 ? detailsValid : step === 2 ? mediaValid : true;

  const rentalByPeriod = {
    hourly: offerRent && rentPeriod === 'hourly' ? rentalAmount : '',
    weekly: offerRent && rentPeriod === 'weekly' ? rentalAmount : '',
    monthly: offerRent && rentPeriod === 'monthly' ? rentalAmount : '',
    yearly: offerRent && rentPeriod === 'yearly' ? rentalAmount : '',
  };

  const rentPeriodOptions = [
    { value: 'hourly' as const, label: t('equipmentListing.hourlyBadge') },
    { value: 'weekly' as const, label: t('equipmentListing.weeklyBadge') },
    { value: 'monthly' as const, label: t('equipmentListing.monthlyBadge') },
    { value: 'yearly' as const, label: t('equipmentListing.yearlyBadge') },
  ];

  const handleBack = () => {
    if (step > 0) {
      setStep((s) => s - 1);
      return;
    }
    navigation.goBack();
  };

  const handleNext = () => {
    if (step < lastStep) setStep((s) => s + 1);
  };

  const equipmentTypeLabel = equipmentTypeOptions.find(
    (option) => option.value === equipmentType,
  )?.label;

  const handlePublish = async () => {
    if (publishing || !mode) return;
    if (editingId && !sourceListing) return;
    if (isBuyer && requestMode === 'rfq' && listedUntil.getTime() <= Date.now()) {
      const keptOriginal = originalListedUntil.current === listedUntil.getTime();
      if (!keptOriginal) {
        showAppAlert(t('common.error'), t('equipmentListing.listedUntilPast'));
        return;
      }
    }
    const auctionStart =
      isBuyer && requestMode === 'auction'
        ? !auctionStartDate || auctionStartDate.getTime() <= Date.now()
          ? new Date()
          : auctionStartDate
        : auctionStartDate;
    setPublishing(true);
    try {
      const persistedMedia = await persistListingMedia(media);
      const body = {
        category: 'equipment' as const,
        mode: mode as EquipmentListingMode,
        equipmentTypeLabel: equipmentType ?? '',
        title,
        description,
        hourlyRental: isBuyer ? '' : rentalByPeriod.hourly,
        monthlyRental: isBuyer ? '' : rentalByPeriod.monthly,
        weeklyRental: isBuyer ? '' : rentalByPeriod.weekly,
        yearlyRental: isBuyer ? '' : rentalByPeriod.yearly,
        salePrice: isBuyer || !offerSell ? '' : salePrice,
        units,
        location,
        media: persistedMedia,
        deliveryAvailable: isBuyer ? false : deliveryAvailable,
        deliveryType,
        deliveryPricePerKm,
        neededDate: null,
        expiryHours:
          isBuyer && requestMode === 'auction'
            ? Math.max(1, Math.ceil(durationHours))
            : isBuyer
              ? expiryHoursUntil(listedUntil)
              : 24 * 365,
        postedAs: editingId
          ? (sourceListing?.postedAs ?? 'supplier')
          : useMarketplaceRoleStore.getState().role,
        requestMode: isBuyer ? requestMode : ('rfq' as const),
        ...(isBuyer && requestMode === 'auction' && auctionStart
          ? {
              auctionStartDate: auctionStart.getTime(),
              auctionEndDate: auctionStart.getTime() + durationHours * 60 * 60 * 1000,
            }
          : {}),
      };
      const listing = editingId
        ? await listingsApi.update(editingId, body)
        : await listingsApi.create(body);
      if (editingId) {
        cacheListing(listing);
        navigation.goBack();
        return;
      }
      if (isEquipmentListing(listing)) addListing(listing);
      navigation.reset({
        index: 1,
        routes: [
          { name: 'Dashboard', params: { screen: 'Requests', params: { category: 'equipment' } } },
          {
            name: 'Welcome',
            params: { next: 'listings', category: 'equipment', listingId: listing.id },
          },
        ],
      });
    } catch (error) {
      const message = error instanceof ApiError ? error.message : '';
      if (message.includes('already rented or sold')) {
        showAppAlert(t('equipmentListing.unitsBelowCommitted'));
        return;
      }
      showAppAlert(t('common.error'), message || t('common.error'));
    } finally {
      setPublishing(false);
    }
  };

  const detailRows = [
    { label: t('equipmentListing.fieldTitle'), value: title },
    { label: t('equipmentListing.fieldDescription'), value: description },
    { label: t('equipmentListing.equipmentType'), value: equipmentTypeLabel ?? '' },
    ...(isBuyer
      ? []
      : [
          ...(offerRent
            ? [
                {
                  label: t('equipmentListing.rentPeriod'),
                  value:
                    rentPeriodOptions.find((option) => option.value === rentPeriod)?.label ?? '',
                },
                {
                  label: t('equipmentListing.rentalAmount', { currency: currency.code }),
                  value: rentalAmount
                    ? `${currency.code} ${formatAmountWithCommas(rentalAmount)}`
                    : '',
                },
              ]
            : []),
          ...(offerSell
            ? [
                {
                  label: t('equipmentListing.salePrice'),
                  value: salePrice ? `${currency.code} ${formatAmountWithCommas(salePrice)}` : '',
                },
              ]
            : []),
        ]),
    { label: t('equipmentListing.units'), value: String(units) },
    ...(isBuyer && requestMode === 'rfq'
      ? [
          {
            label: t('equipmentListing.listedUntil'),
            value: new Intl.DateTimeFormat(currentLanguage, {
              dateStyle: 'medium',
              timeStyle: 'short',
            }).format(listedUntil),
          },
        ]
      : []),
    ...(isBuyer && requestMode === 'auction'
      ? [
          {
            label: t('goldListing.auctionStartDate'),
            value: auctionStartDate
              ? new Intl.DateTimeFormat(currentLanguage, {
                  dateStyle: 'medium',
                  timeStyle: 'short',
                }).format(auctionStartDate)
              : '',
          },
          {
            label: t('goldListing.auctionDuration'),
            value: formatAuctionDurationLabel(durationHours, t),
          },
        ]
      : []),
    { label: t('equipmentListing.fieldLocation'), value: location },
  ].filter((row) => (row.value ?? '').trim().length > 0);

  const deliverySubtitle =
    !isBuyer && deliveryAvailable
      ? deliveryType === 'free'
        ? t('equipmentListing.deliveryFree')
        : `${t('equipmentListing.deliveryPerKm')} · ${currency.code} ${formatAmountWithCommas(deliveryPricePerKm)}`
      : undefined;

  return (
    <View style={styles.root}>
      <StatusBar style="light" />

      <AppTopBar
        left="back"
        variant="gold"
        title={
          editingId
            ? t('equipmentListing.editFormTitle')
            : isBuyer
              ? t('equipmentListing.modeTitle')
              : mode === 'sell'
                ? t('equipmentListing.sellFormTitle')
                : mode === 'both'
                  ? t('equipmentListing.bothFormTitle')
                  : t('equipmentListing.rentFormTitle')
        }
        onBackPress={handleBack}
        style={styles.header}
      />
      <View style={styles.stepperWrap}>
        <ListingStepper steps={steps} currentStep={step} />
      </View>

      <KeyboardAwareScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        showsVerticalScrollIndicator={false}
        bounces={false}
        overScrollMode="never"
        bottomOffset={96}
        extraKeyboardSpace={0}
        disableScrollOnKeyboardHide
      >
        {step === 0 ? (
          <View style={styles.stepBlock}>
            <AppText weight="bold" style={styles.offerHeading}>
              {t('equipmentListing.offerHeading')}
            </AppText>
            <AppText style={styles.offerHint}>{t('equipmentListing.offerHint')}</AppText>
            <OfferChoiceCard
              selected={offerRent}
              icon="key-outline"
              title={t('equipmentListing.rent')}
              subtitle={
                isBuyer ? t('equipmentListing.rentRequestSubtitle') : t('equipmentListing.rentSubtitle')
              }
              onPress={() => setOfferRent((current) => !current)}
            />
            <OfferChoiceCard
              selected={offerSell}
              icon="pricetag-outline"
              title={isBuyer ? t('equipmentListing.buy') : t('equipmentListing.sell')}
              subtitle={
                isBuyer ? t('equipmentListing.buyRequestSubtitle') : t('equipmentListing.sellSubtitle')
              }
              onPress={() => setOfferSell((current) => !current)}
            />
          </View>
        ) : null}

        {step === 1 ? (
          <View style={styles.stepBlock}>
            {isBuyer ? (
              <View style={styles.choiceRow}>
                <OptionRowCard
                  compact
                  selected={requestMode === 'rfq'}
                  icon="document-text-outline"
                  title={t('equipmentListing.requestRfq')}
                  subtitle={t('equipmentListing.requestRfqSubtitle')}
                  onPress={() => setRequestMode('rfq')}
                />
                <OptionRowCard
                  compact
                  selected={requestMode === 'auction'}
                  icon="hammer-outline"
                  title={t('equipmentListing.requestAuction')}
                  subtitle={t('equipmentListing.requestAuctionSubtitle')}
                  onPress={() => setRequestMode('auction')}
                />
              </View>
            ) : null}

            <FormInput
              label={t('equipmentListing.fieldTitle')}
              value={title}
              onChangeText={setTitle}
              placeholder={t('equipmentListing.titlePlaceholder')}
              required
              maxLength={LISTING_TITLE_MAX_LENGTH}
              showCounter
            />

            <FormInput
              label={t('equipmentListing.fieldDescription')}
              value={description}
              onChangeText={setDescription}
              placeholder={t('equipmentListing.descriptionPlaceholder')}
              multiline
              numberOfLines={4}
              style={styles.descriptionInput}
              maxLength={LISTING_DESCRIPTION_MAX_LENGTH}
              showCounter
            />

            <SelectField
              label={t('equipmentListing.equipmentType')}
              placeholder={t('equipmentListing.equipmentTypePlaceholder')}
              sheetTitle={t('equipmentListing.equipmentType')}
              options={equipmentTypeOptions}
              value={equipmentType}
              onChange={setEquipmentType}
              required
              searchable
              searchPlaceholder={t('equipmentListing.searchTypes')}
            />

            {!isBuyer && offerRent ? (
              <View style={styles.priceRow}>
                <View style={styles.priceInput}>
                  <SelectField
                    label={t('equipmentListing.rentPeriod')}
                    placeholder={t('equipmentListing.rentPeriodPlaceholder')}
                    sheetTitle={t('equipmentListing.rentPeriod')}
                    options={rentPeriodOptions}
                    value={rentPeriod}
                    onChange={(next) => setRentPeriod(next as RentPeriod)}
                    required
                  />
                </View>
                <View style={styles.priceInput}>
                  <FormInput
                    label={t('equipmentListing.rentalAmount', { currency: currency.code })}
                    value={rentalAmount}
                    onChangeText={(value) => setRentalAmount(sanitizeStepPrice(value))}
                    keyboardType="numeric"
                    placeholder={currency.code}
                    required
                    error={
                      rentalAmount && !parsePositiveAmount(rentalAmount)
                        ? t('common.priceGreaterThanZero')
                        : undefined
                    }
                    rightAdornment={
                      <AppText style={styles.priceAdornment}>{t('rfq.pricePerUnit')}</AppText>
                    }
                  />
                </View>
              </View>
            ) : null}

            {!isBuyer && offerSell ? (
              <FormInput
                label={t('equipmentListing.salePriceWithCurrency', { currency: currency.code })}
                value={salePrice}
                onChangeText={(value) => setSalePrice(sanitizeStepPrice(value))}
                keyboardType="numeric"
                placeholder={currency.code}
                required
                error={
                  salePrice && !parsePositiveAmount(salePrice)
                    ? t('common.priceGreaterThanZero')
                    : undefined
                }
                rightAdornment={
                  <AppText style={styles.priceAdornment}>{t('rfq.pricePerUnit')}</AppText>
                }
              />
            ) : null}

            <CounterField
              label={t('equipmentListing.units')}
              value={units}
              onChange={setUnits}
              min={1}
              required
            />
          </View>
        ) : null}

        {step === 2 ? (
          <View style={styles.stepBlock}>
            <EquipmentMediaUploader
              media={media}
              onChange={setMedia}
              onBusyChange={setMediaBusy}
              required={!isBuyer}
            />
            {isBuyer && requestMode === 'rfq' ? (
              <DateTimeField
                label={t('equipmentListing.listedUntil')}
                value={listedUntil}
                required
                minimumDate={new Date()}
                placeholder={t('equipmentListing.listedUntilPlaceholder')}
                onChange={setListedUntil}
              />
            ) : null}
            {isBuyer && requestMode === 'auction' ? (
              <>
                <DateTimeField
                  label={t('goldListing.auctionStartDate')}
                  value={auctionStartDate}
                  required
                  minimumDate={new Date()}
                  placeholder={t('goldListing.auctionStartDatePlaceholder')}
                  onChange={setAuctionStartDate}
                />
                <DurationSlider
                  label={t('goldListing.auctionDuration')}
                  value={durationHours}
                  onChange={setDurationHours}
                />
              </>
            ) : null}
            <LocationField
              label={t('equipmentListing.fieldLocation')}
              value={location}
              required
              loading={locationLoading}
              onChangeText={setLocation}
              onUseCurrentLocation={() => void handleUseCurrentLocation()}
              onSelectOnMap={handleSelectOnMap}
            />
            {!isBuyer ? (
              <ToggleRow
                title={t('equipmentListing.deliveryAvailable')}
                subtitle={t('equipmentListing.deliveryAvailableSubtitle')}
                enabled={deliveryAvailable}
                onToggle={setDeliveryAvailable}
              />
            ) : null}

            {!isBuyer && deliveryAvailable ? (
              <View style={styles.deliveryTypeBlock}>
                <SegmentedSwitcher
                  value={deliveryType}
                  onChange={setDeliveryType}
                  options={[
                    { key: 'free', label: t('equipmentListing.deliveryFree') },
                    { key: 'perKm', label: t('equipmentListing.deliveryPerKm') },
                  ]}
                />

                {deliveryType === 'perKm' ? (
                  <FormInput
                    label={t('equipmentListing.deliveryPricePerKm', { currency: currency.code })}
                    value={deliveryPricePerKm}
                    onChangeText={(value) => setDeliveryPricePerKm(sanitizeStepPrice(value))}
                    error={
                      deliveryPricePerKm && !parsePositiveAmount(deliveryPricePerKm)
                        ? t('common.priceGreaterThanZero')
                        : undefined
                    }
                    placeholder={currency.code}
                    keyboardType="numeric"
                    required
                  />
                ) : null}
              </View>
            ) : null}
          </View>
        ) : null}

        {step === 3 ? (
          <EquipmentListingReview
            detailRows={detailRows}
            media={media}
            deliveryAvailable={!isBuyer && deliveryAvailable}
            deliverySubtitle={deliverySubtitle}
            onChangeDetails={() => setStep(1)}
            onChangeMedia={() => setStep(2)}
            onPublish={handlePublish}
            publishing={publishing}
            publishLabel={editingId ? t('equipmentListing.update') : undefined}
          />
        ) : null}

        {step !== lastStep ? (
          <Button
            label={t('common.continue')}
            onPress={handleNext}
            disabled={!canGoNext}
            style={styles.continueButton}
          />
        ) : null}
      </KeyboardAwareScrollView>

      {mapPickerSheet}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: palette.gold,
  },
  header: {
    paddingBottom: spacing.md,
  },
  stepperWrap: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    backgroundColor: palette.gold,
  },
  scroll: {
    flex: 1,
    backgroundColor: palette.pureWhite,
    borderTopLeftRadius: radius.lg + 4,
    borderTopRightRadius: radius.lg + 4,
    marginTop: -(radius.lg + 4),
    overflow: 'hidden',
  },
  content: {
    padding: spacing.lg,
    gap: spacing.md,
    paddingBottom: spacing.xxl,
  },
  stepBlock: {
    gap: spacing.md,
  },
  offerHeading: {
    fontSize: 24,
    lineHeight: 30,
    color: palette.charcoal,
  },
  offerHint: {
    fontSize: 15,
    lineHeight: 22,
    color: palette.charcoal,
    marginTop: -spacing.xs,
  },
  choiceRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  descriptionInput: {
    minHeight: 96,
    paddingTop: spacing.sm,
    textAlignVertical: 'top',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  priceInput: {
    flex: 1,
  },
  priceAdornment: {
    fontSize: 12,
    color: palette.muted,
  },
  deliveryTypeBlock: {
    gap: spacing.md,
  },
  continueButton: {
    marginTop: spacing.sm,
  },
});
