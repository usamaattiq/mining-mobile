import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { i18n as appI18n } from '@/i18n';
import type { EquipmentListingMode, RootStackParamList } from '@/navigation/types';
import { AppTopBar } from '@/shared/components/AppTopBar';
import { FormInput } from '@/shared/components/FormInput';
import { SelectField } from '@/shared/components/SelectField';
import { DateTimeField } from '@/shared/components/DateTimeField';
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
import { formatAmountWithCommas } from '@/shared/utils/formatAmount';
import type { EquipmentMediaAsset } from '@/features/listings/types/equipmentMedia.types';
import type { DeliveryType, EquipmentListing } from '@/features/listings/types/equipmentListing.types';

type Props = NativeStackScreenProps<RootStackParamList, 'EquipmentListingForm'>;

export function EquipmentListingFormScreen({ navigation, route }: Props): React.ReactElement {
  const { t } = useTranslation(undefined, { i18n: appI18n });
  const { currentLanguage } = useLanguage();
  const currency = useCurrency();
  const role = useMarketplaceRoleStore((state) => state.role);
  const isBuyer = role === 'buyer';
  const [mode, setMode] = React.useState<EquipmentListingMode | null>(isBuyer ? 'sell' : null);
  const isRent = mode === 'rent';

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

  const equipmentTypeOptions = [
    {
      value: 'excavator',
      label: t('equipmentListing.type.excavator'),
      icon: 'construct-outline' as const,
    },
    {
      value: 'bulldozer',
      label: t('equipmentListing.type.bulldozer'),
      icon: 'construct-outline' as const,
    },
    {
      value: 'drillRig',
      label: t('equipmentListing.type.drillRig'),
      icon: 'construct-outline' as const,
    },
    {
      value: 'loader',
      label: t('equipmentListing.type.loader'),
      icon: 'construct-outline' as const,
    },
    {
      value: 'crusher',
      label: t('equipmentListing.type.crusher'),
      icon: 'construct-outline' as const,
    },
    { value: 'other', label: t('equipmentListing.type.other'), icon: 'construct-outline' as const },
  ];

  const [equipmentType, setEquipmentType] = React.useState<string | null>(null);
  const [title, setTitle] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [hourlyRental, setHourlyRental] = React.useState('');
  const [monthlyRental, setMonthlyRental] = React.useState('');
  const [weeklyRental, setWeeklyRental] = React.useState('');
  const [salePrice, setSalePrice] = React.useState('');
  const [units, setUnits] = React.useState(1);
  const [location, setLocation] = React.useState('');
  const [neededDate, setNeededDate] = React.useState<Date | null>(null);
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
    setMode(isBuyer ? 'sell' : sourceListing.mode);
    setEquipmentType(matchSelectOption(equipmentTypeOptions, sourceListing.equipmentTypeLabel));
    setTitle(sourceListing.title);
    setDescription(sourceListing.description ?? '');
    setHourlyRental(isBuyer ? '' : sourceListing.hourlyRental ?? '');
    setMonthlyRental(isBuyer ? '' : sourceListing.monthlyRental ?? '');
    setWeeklyRental(isBuyer ? '' : sourceListing.weeklyRental ?? '');
    setSalePrice(isBuyer ? '' : sourceListing.salePrice ?? '');
    setUnits(Math.max(sourceListing.units ?? 1, 1));
    setLocation(sourceListing.location ?? '');
    setNeededDate(
      sourceListing.neededDate && sourceListing.neededDate > Date.now()
        ? new Date(sourceListing.neededDate)
        : null,
    );
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
  }, [equipmentTypeOptions, sourceListing]);

  const handleUseCurrentLocation = async () => {
    const selection = await getCurrentLocation();
    if (!selection) return;
    setLocation(selection.label);
    setLocationCoords({ latitude: selection.latitude, longitude: selection.longitude });
  };

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
      (isRent
        ? hourlyRental.trim() || monthlyRental.trim() || weeklyRental.trim()
        : salePrice.trim())),
  );
  const deliveryValid =
    !deliveryAvailable || deliveryType === 'free' || deliveryPricePerKm.trim().length > 0;
  const mediaValid =
    media.length > 0 &&
    !mediaBusy &&
    location.trim().length > 0 &&
    deliveryValid &&
    (!isBuyer || Boolean(neededDate));
  const canGoNext = step === 0 ? detailsValid : step === 1 ? mediaValid : true;

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
    setPublishing(true);
    try {
      const persistedMedia = await persistListingMedia(media);
      const listing = await listingsApi.create({
        category: 'equipment',
        mode: isBuyer ? 'sell' : mode,
        equipmentTypeLabel: equipmentTypeLabel ?? '',
        title,
        description,
        hourlyRental: isBuyer ? '' : hourlyRental,
        monthlyRental: isBuyer ? '' : monthlyRental,
        weeklyRental: isBuyer ? '' : weeklyRental,
        salePrice: isBuyer ? '' : salePrice,
        units,
        location,
        media: persistedMedia,
        deliveryAvailable,
        deliveryType,
        deliveryPricePerKm,
        neededDate: isBuyer && neededDate ? neededDate.getTime() : null,
        postedAs: useMarketplaceRoleStore.getState().role,
      });
      if (isEquipmentListing(listing)) addListing(listing);
      navigation.reset({
        index: 1,
        routes: [
          { name: 'Dashboard', params: { screen: 'Requests', params: { category: 'equipment' } } },
          { name: 'Welcome', params: { next: 'listings', category: 'equipment' } },
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
      : isRent
        ? [
            {
              label: t('equipmentListing.hourlyRental', { currency: currency.code }),
              value: hourlyRental ? `${currency.code} ${formatAmountWithCommas(hourlyRental)}` : '',
            },
            {
              label: t('equipmentListing.weeklyRental', { currency: currency.code }),
              value: weeklyRental ? `${currency.code} ${formatAmountWithCommas(weeklyRental)}` : '',
            },
            {
              label: t('equipmentListing.monthlyRental', { currency: currency.code }),
              value: monthlyRental
                ? `${currency.code} ${formatAmountWithCommas(monthlyRental)}`
                : '',
            },
          ]
        : [
            {
              label: t('equipmentListing.salePrice'),
              value: salePrice ? `${currency.code} ${formatAmountWithCommas(salePrice)}` : '',
            },
          ]),
    { label: t('equipmentListing.units'), value: String(units) },
    ...(!isBuyer
      ? []
      : [
          {
            label: t('equipmentListing.neededDate'),
            value: neededDate
              ? new Intl.DateTimeFormat(currentLanguage, {
                  dateStyle: 'medium',
                  timeStyle: 'short',
                }).format(neededDate)
              : '',
          },
        ]),
    { label: t('equipmentListing.location'), value: location },
  ].filter((row) => (row.value ?? '').trim().length > 0);

  const deliverySubtitle = deliveryAvailable
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
        showsVerticalScrollIndicator={false}
        bottomOffset={24}
        extraKeyboardSpace={0}
      >
        {step === 0 ? (
          <View style={styles.stepBlock}>
            {!isBuyer ? (
              <View style={styles.choiceRow}>
                <OptionRowCard
                  compact
                  selected={mode === 'rent'}
                  icon="key-outline"
                  title={t('equipmentListing.rent')}
                  subtitle={t('equipmentListing.rentSubtitle')}
                  onPress={() => setMode('rent')}
                />
                <OptionRowCard
                  compact
                  selected={mode === 'sell'}
                  icon="pricetag-outline"
                  title={t('equipmentListing.sell')}
                  subtitle={t('equipmentListing.sellSubtitle')}
                  onPress={() => setMode('sell')}
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

            {!isBuyer && mode === 'rent' ? (
              <View style={styles.priceRow}>
                <View style={styles.priceInput}>
                  <FormInput
                    label={t('equipmentListing.hourlyRental', { currency: currency.code })}
                    value={hourlyRental}
                    onChangeText={setHourlyRental}
                    keyboardType="numeric"
                    placeholder={currency.code}
                  />
                </View>
                <View style={styles.priceInput}>
                  <FormInput
                    label={t('equipmentListing.weeklyRental', { currency: currency.code })}
                    value={weeklyRental}
                    onChangeText={setWeeklyRental}
                    keyboardType="numeric"
                    placeholder={currency.code}
                  />
                </View>
                <View style={styles.priceInput}>
                  <FormInput
                    label={t('equipmentListing.monthlyRental', { currency: currency.code })}
                    value={monthlyRental}
                    onChangeText={setMonthlyRental}
                    keyboardType="numeric"
                    placeholder={currency.code}
                  />
                </View>
              </View>
            ) : !isBuyer && mode === 'sell' ? (
              <FormInput
                label={t('equipmentListing.salePrice')}
                value={salePrice}
                onChangeText={setSalePrice}
                keyboardType="numeric"
                placeholder={currency.code}
                required
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
            <EquipmentMediaUploader media={media} onChange={setMedia} onBusyChange={setMediaBusy} />
            {isBuyer ? (
              <DateTimeField
                label={t('equipmentListing.neededDate')}
                value={neededDate}
                required
                placeholder={t('equipmentListing.neededDatePlaceholder')}
                onChange={setNeededDate}
              />
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
            <ToggleRow
              title={t('equipmentListing.deliveryAvailable')}
              subtitle={t('equipmentListing.deliveryAvailableSubtitle')}
              enabled={deliveryAvailable}
              onToggle={setDeliveryAvailable}
            />

            {deliveryAvailable ? (
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
                    label={t('equipmentListing.deliveryPricePerKm')}
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
            deliveryAvailable={deliveryAvailable}
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

      {publishing ? (
        <View style={styles.publishOverlay}>
          <ActivityIndicator size="large" color={palette.pureWhite} />
        </View>
      ) : null}

      {mapPickerSheet}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: palette.gold,
  },
  publishOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 20,
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
    gap: spacing.sm,
  },
  priceInput: {
    flex: 1,
  },
  deliveryTypeBlock: {
    gap: spacing.md,
  },
  continueButton: {
    marginTop: spacing.sm,
  },
});
