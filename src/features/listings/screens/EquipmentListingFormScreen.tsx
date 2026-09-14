import React from 'react';
import { StyleSheet, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { i18n as appI18n } from '@/i18n';
import type { RootStackParamList } from '@/navigation/types';
import { AppTopBar } from '@/shared/components/AppTopBar';
import { AppText } from '@/shared/components/AppText';
import { FormInput } from '@/shared/components/FormInput';
import { SelectField } from '@/shared/components/SelectField';
import { CounterField } from '@/shared/components/CounterField';
import { LocationField } from '@/shared/components/LocationField';
import { useLocationMapPicker } from '@/shared/hooks/useLocationMapPicker';
import { ToggleRow } from '@/shared/components/ToggleRow';
import { SegmentedSwitcher } from '@/shared/components/SegmentedSwitcher';
import { Button } from '@/shared/components/Button';
import { ListingStepper } from '@/features/listings/components/ListingStepper';
import { EquipmentMediaUploader } from '@/features/listings/components/EquipmentMediaUploader';
import { EquipmentListingReview } from '@/features/listings/components/EquipmentListingReview';
import { palette, radius, spacing } from '@/theme';
import { showAppAlert } from '@/shared/services/appAlert';
import { ApiError } from '@/shared/services/api';
import { listingsApi, isEquipmentListing } from '@/features/listings/api/listingsApi';
import { persistListingMedia } from '@/features/listings/utils/persistListingMedia';
import { useListingsStore } from '@/store/listingsStore';
import { useCurrency } from '@/shared/hooks/useCurrency';
import { formatAmountWithCommas } from '@/shared/utils/formatAmount';
import type { EquipmentMediaAsset } from '@/features/listings/types/equipmentMedia.types';
import type { DeliveryType } from '@/features/listings/types/equipmentListing.types';

type Props = NativeStackScreenProps<RootStackParamList, 'EquipmentListingForm'>;

export function EquipmentListingFormScreen({ navigation, route }: Props): React.ReactElement {
  const { mode } = route.params;
  const { t } = useTranslation(undefined, { i18n: appI18n });
  const currency = useCurrency();
  const currencyAdornment = (
    <AppText weight="semibold" style={styles.currencyAdornment}>
      {currency.code}
    </AppText>
  );
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
  const [locationCoords, setLocationCoords] = React.useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [media, setMedia] = React.useState<EquipmentMediaAsset[]>([]);
  const [deliveryAvailable, setDeliveryAvailable] = React.useState(false);
  const [deliveryType, setDeliveryType] = React.useState<DeliveryType>('free');
  const [deliveryPricePerKm, setDeliveryPricePerKm] = React.useState('');
  const { locationLoading, getCurrentLocation, openMapPickerForSelection, mapPickerSheet } =
    useLocationMapPicker();

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
    equipmentType &&
    title.trim() &&
    units > 0 &&
    (isRent
      ? hourlyRental.trim() || monthlyRental.trim() || weeklyRental.trim()
      : salePrice.trim()),
  );
  const deliveryValid =
    !deliveryAvailable || deliveryType === 'free' || deliveryPricePerKm.trim().length > 0;
  const mediaValid = media.length > 0 && location.trim().length > 0 && deliveryValid;
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
    if (publishing) return;
    setPublishing(true);
    try {
      const persistedMedia = await persistListingMedia(media);
      const listing = await listingsApi.create({
        category: 'equipment',
        mode,
        equipmentTypeLabel: equipmentTypeLabel ?? '',
        title,
        description,
        hourlyRental,
        monthlyRental,
        weeklyRental,
        salePrice,
        units,
        location,
        media: persistedMedia,
        deliveryAvailable,
        deliveryType,
        deliveryPricePerKm,
      });
      if (isEquipmentListing(listing)) addListing(listing);
      navigation.popToTop();
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
    ...(isRent
      ? [
          {
            label: t('equipmentListing.hourlyRental'),
            value: hourlyRental ? `${currency.code} ${formatAmountWithCommas(hourlyRental)}` : '',
          },
          {
            label: t('equipmentListing.weeklyRental'),
            value: weeklyRental ? `${currency.code} ${formatAmountWithCommas(weeklyRental)}` : '',
          },
          {
            label: t('equipmentListing.monthlyRental'),
            value: monthlyRental ? `${currency.code} ${formatAmountWithCommas(monthlyRental)}` : '',
          },
        ]
      : [
          {
            label: t('equipmentListing.salePrice'),
            value: salePrice ? `${currency.code} ${formatAmountWithCommas(salePrice)}` : '',
          },
        ]),
    { label: t('equipmentListing.units'), value: String(units) },
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
        title={isRent ? t('equipmentListing.rentFormTitle') : t('equipmentListing.sellFormTitle')}
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
        bottomOffset={100}
      >
        {step === 0 ? (
          <View style={styles.stepBlock}>
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

            {isRent ? (
              <View style={styles.priceRow}>
                <View style={styles.priceInput}>
                  <FormInput
                    label={t('equipmentListing.hourlyRental')}
                    value={hourlyRental}
                    onChangeText={setHourlyRental}
                    keyboardType="numeric"
                    leftAdornment={currencyAdornment}
                  />
                </View>
                <View style={styles.priceInput}>
                  <FormInput
                    label={t('equipmentListing.weeklyRental')}
                    value={weeklyRental}
                    onChangeText={setWeeklyRental}
                    keyboardType="numeric"
                    leftAdornment={currencyAdornment}
                  />
                </View>
                <View style={styles.priceInput}>
                  <FormInput
                    label={t('equipmentListing.monthlyRental')}
                    value={monthlyRental}
                    onChangeText={setMonthlyRental}
                    keyboardType="numeric"
                    leftAdornment={currencyAdornment}
                  />
                </View>
              </View>
            ) : (
              <FormInput
                label={t('equipmentListing.salePrice')}
                value={salePrice}
                onChangeText={setSalePrice}
                keyboardType="numeric"
                leftAdornment={currencyAdornment}
                required
              />
            )}

            <View style={styles.unitsField}>
              <CounterField
                label={t('equipmentListing.units')}
                value={units}
                onChange={setUnits}
                min={1}
                required
              />
            </View>
          </View>
        ) : null}

        {step === 1 ? (
          <View style={styles.stepBlock}>
            <EquipmentMediaUploader media={media} onChange={setMedia} />
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
                    placeholder={t('equipmentListing.deliveryPricePerKmPlaceholder')}
                    keyboardType="numeric"
                    leftAdornment={currencyAdornment}
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
  },
  content: {
    padding: spacing.lg,
    gap: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  stepBlock: {
    gap: spacing.lg,
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
  currencyAdornment: {
    fontSize: 15,
    color: palette.muted,
  },
  unitsField: {
    width: '50%',
  },
  deliveryTypeBlock: {
    gap: spacing.md,
  },
  continueButton: {
    marginTop: spacing.sm,
  },
});
