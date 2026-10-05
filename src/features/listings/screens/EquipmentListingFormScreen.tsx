import React from 'react';
import { StyleSheet, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { i18n as appI18n } from '@/i18n';
import type { RootStackParamList } from '@/navigation/types';
import { AppText } from '@/shared/components/AppText';
import { AppTopBar } from '@/shared/components/AppTopBar';
import { FormInput } from '@/shared/components/FormInput';
import { SelectField } from '@/shared/components/SelectField';
import { DateTimeField } from '@/shared/components/DateTimeField';
import { DurationSlider, formatAuctionDurationLabel } from '@/features/listings/components/DurationSlider';
import { useCatalogOptions } from '@/features/listings/utils/useCatalogOptions';
import { defaultListingEnd, expiryHoursUntil } from '@/features/listings/utils/listingExpiry';
import { CounterField } from '@/shared/components/CounterField';
import { LocationField } from '@/shared/components/LocationField';
import { useLocationMapPicker } from '@/shared/hooks/useLocationMapPicker';
import { ToggleRow } from '@/shared/components/ToggleRow';
import { SegmentedSwitcher } from '@/shared/components/SegmentedSwitcher';
import { Button } from '@/shared/components/Button';
import { OptionRowCard } from '@/shared/components/OptionRowCard';
import { ListingStepper } from '@/features/listings/components/ListingStepper';
import { EquipmentMediaUploader } from '@/features/listings/components/EquipmentMediaUploader';
import { EquipmentListingReview } from '@/features/listings/components/EquipmentListingReview';
import { palette, radius, spacing } from '@/theme';
import { showAppAlert } from '@/shared/services/appAlert';
import { ApiError } from '@/shared/services/api';
import { listingsApi, isEquipmentListing } from '@/features/listings/api/listingsApi';
import { persistListingMedia } from '@/features/listings/utils/persistListingMedia';
import { matchSelectOption, cloneRepostMedia } from '@/features/listings/utils/matchSelectOption';
import { useListingsStore } from '@/store/listingsStore';
import { useMarketplaceRoleStore } from '@/store/marketplaceRoleStore';
import { useCurrency } from '@/shared/hooks/useCurrency';
import { useLanguage } from '@/i18n/hooks/useLanguage';
import { formatAmountWithCommas, parsePositiveAmount } from '@/shared/utils/formatAmount';
import type { EquipmentMediaAsset } from '@/features/listings/types/equipmentMedia.types';
import type { DeliveryType, EquipmentListing } from '@/features/listings/types/equipmentListing.types';

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
  const role = useMarketplaceRoleStore((state) => state.role);
  const isBuyer = role === 'buyer';
  const [requestMode, setRequestMode] = React.useState<'rfq' | 'auction'>('rfq');
  const [offerRent, setOfferRent] = React.useState(false);
  const [offerSell, setOfferSell] = React.useState(isBuyer);
  const mode = offerRent && offerSell ? 'both' : offerRent ? 'rent' : offerSell ? 'sell' : null;

  const steps = [
    { key: 'details', label: t('equipmentListing.detailsStep') },
    { key: 'media', label: t('equipmentListing.mediaStep') },
    { key: 'review', label: t('equipmentListing.reviewStep') },
  ];
  const lastStep = steps.length - 1;
  const [step, setStep] = React.useState(0);
  const [publishing, setPublishing] = React.useState(false);
  const addListing = useListingsStore((state) => state.addListing);
  const repostListing = useListingsStore((state) =>
    route.params?.repostId
      ? state.listings.find((item) => item.id === route.params?.repostId)
      : undefined,
  );
  const filledRepost = React.useRef(false);
  const [fetchedRepost, setFetchedRepost] = React.useState<EquipmentListing | undefined>(undefined);
  const sourceListing = repostListing ?? fetchedRepost;

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
    const id = route.params?.repostId;
    if (!id || repostListing) return;
    let cancelled = false;
    void listingsApi.get(id).then((listing) => {
      if (!cancelled && isEquipmentListing(listing)) setFetchedRepost(listing);
    });
    return () => {
      cancelled = true;
    };
  }, [repostListing, route.params?.repostId]);

  React.useEffect(() => {
    if (!sourceListing || filledRepost.current) return;
    filledRepost.current = true;
    const period = isBuyer ? null : rentPeriodFromListing(sourceListing);
    setOfferRent(!isBuyer && (sourceListing.mode === 'rent' || sourceListing.mode === 'both'));
    setOfferSell(
      isBuyer || sourceListing.mode === 'sell' || sourceListing.mode === 'both',
    );
    setEquipmentType(matchSelectOption(equipmentTypeOptions, sourceListing.equipmentTypeLabel));
    setTitle(sourceListing.title);
    setDescription(sourceListing.description ?? '');
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
    setSalePrice(isBuyer ? '' : sourceListing.salePrice ?? '');
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
  }, [equipmentTypeOptions, isBuyer, sourceListing]);

  const handleUseCurrentLocation = async () => {
    const selection = await getCurrentLocation();
    if (!selection) return;
    setLocation(selection.label);
    setLocationCoords({ latitude: selection.latitude, longitude: selection.longitude });
  };

  const autoLocated = React.useRef(false);
  React.useEffect(() => {
    if (step !== 1 || autoLocated.current || location.trim()) return;
    autoLocated.current = true;
    void handleUseCurrentLocation();
  }, [step, location]);

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
  const canGoNext = step === 0 ? detailsValid : step === 1 ? mediaValid : true;

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
    if (isBuyer && requestMode === 'rfq' && listedUntil.getTime() <= Date.now()) {
      showAppAlert(t('common.error'), t('equipmentListing.listedUntilPast'));
      return;
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
      const listing = await listingsApi.create({
        category: 'equipment',
        mode: isBuyer ? 'sell' : mode,
        equipmentTypeLabel: equipmentTypeLabel ?? '',
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
        postedAs: useMarketplaceRoleStore.getState().role,
        requestMode: isBuyer ? requestMode : 'rfq',
        ...(isBuyer && requestMode === 'auction' && auctionStart
          ? {
              auctionStartDate: auctionStart.getTime(),
              auctionEndDate: auctionStart.getTime() + durationHours * 60 * 60 * 1000,
            }
          : {}),
      });
      if (isEquipmentListing(listing)) addListing(listing);
      navigation.reset({
        index: 1,
        routes: [
          { name: 'Dashboard', params: { screen: 'Requests', params: { category: 'equipment' } } },
          { name: 'Welcome', params: { next: 'listings', category: 'equipment', listingId: listing.id } },
        ],
      });
    } catch (error) {
      showAppAlert(
        t('common.error'),
        error instanceof ApiError ? error.message : t('common.error'),
      );
    } finally {
      setPublishing(false);
    }
  };

  const detailRows = [
    { label: t('equipmentListing.equipmentType'), value: equipmentTypeLabel ?? '' },
    { label: t('equipmentListing.title'), value: title },
    { label: t('equipmentListing.description'), value: description },
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
    { label: t('equipmentListing.location'), value: location },
  ].filter((row) => (row.value ?? '').trim().length > 0);

  const deliverySubtitle = !isBuyer && deliveryAvailable
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
          isBuyer
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
        bottomOffset={72}
        extraKeyboardSpace={0}
      >
        {step === 0 ? (
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
            {!isBuyer ? (
              <View style={styles.choiceRow}>
                <OptionRowCard
                  compact
                  selected={offerRent}
                  icon="key-outline"
                  title={t('equipmentListing.rent')}
                  subtitle={t('equipmentListing.rentSubtitle')}
                  onPress={() => setOfferRent((current) => !current)}
                />
                <OptionRowCard
                  compact
                  selected={offerSell}
                  icon="pricetag-outline"
                  title={t('equipmentListing.sell')}
                  subtitle={t('equipmentListing.sellSubtitle')}
                  onPress={() => setOfferSell((current) => !current)}
                />
              </View>
            ) : null}

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

            <FormInput
              label={t('equipmentListing.title')}
              value={title}
              onChangeText={setTitle}
              placeholder={t('equipmentListing.titlePlaceholder')}
              required
            />

            <FormInput
              label={t('equipmentListing.description')}
              value={description}
              onChangeText={setDescription}
              placeholder={t('equipmentListing.descriptionPlaceholder')}
              multiline
              numberOfLines={4}
              style={styles.descriptionInput}
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
                    onChangeText={setRentalAmount}
                    keyboardType="numeric"
                    placeholder={currency.code}
                    required
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
                onChangeText={setSalePrice}
                keyboardType="numeric"
                placeholder={currency.code}
                required
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

        {step === 1 ? (
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
              label={t('equipmentListing.location')}
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
                    onChangeText={setDeliveryPricePerKm}
                    placeholder={currency.code}
                    keyboardType="numeric"
                    required
                  />
                ) : null}
              </View>
            ) : null}
          </View>
        ) : null}

        {step === 2 ? (
          <EquipmentListingReview
            detailRows={detailRows}
            media={media}
            deliveryAvailable={!isBuyer && deliveryAvailable}
            deliverySubtitle={deliverySubtitle}
            onChangeDetails={() => setStep(0)}
            onChangeMedia={() => setStep(1)}
            onPublish={handlePublish}
            publishing={publishing}
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
