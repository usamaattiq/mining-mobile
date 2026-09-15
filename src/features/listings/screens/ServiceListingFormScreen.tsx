import React from 'react';
import { StyleSheet, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { i18n as appI18n } from '@/i18n';
import { useLanguage } from '@/i18n/hooks/useLanguage';
import type { RootStackParamList } from '@/navigation/types';
import { AppTopBar } from '@/shared/components/AppTopBar';
import { FormInput } from '@/shared/components/FormInput';
import { SelectField } from '@/shared/components/SelectField';
import { DateTimeField } from '@/shared/components/DateTimeField';
import { LocationField } from '@/shared/components/LocationField';
import { useLocationMapPicker } from '@/shared/hooks/useLocationMapPicker';
import { Button } from '@/shared/components/Button';
import { ListingStepper } from '@/features/listings/components/ListingStepper';
import { ServiceMediaUploader } from '@/features/listings/components/ServiceMediaUploader';
import { EquipmentListingSummaryCard } from '@/features/listings/components/EquipmentListingSummaryCard';
import { AttachmentsSection } from '@/features/listings/components/AttachmentsSection';
import { palette, radius, spacing } from '@/theme';
import { showAppAlert } from '@/shared/services/appAlert';
import { ApiError } from '@/shared/services/api';
import { listingsApi, isServiceListing } from '@/features/listings/api/listingsApi';
import { persistListingMedia } from '@/features/listings/utils/persistListingMedia';
import { useServiceListingsStore } from '@/store/serviceListingsStore';
import { useMarketplaceRoleStore } from '@/store/marketplaceRoleStore';
import { useCurrency } from '@/shared/hooks/useCurrency';
import { formatAmountWithCommas } from '@/shared/utils/formatAmount';
import type { ServiceMediaAsset } from '@/features/listings/types/serviceMedia.types';

type Props = NativeStackScreenProps<RootStackParamList, 'ServiceListingForm'>;

export function ServiceListingFormScreen({ navigation, route }: Props): React.ReactElement {
  const { serviceType } = route.params;
  const { t } = useTranslation(undefined, { i18n: appI18n });
  const { currentLanguage } = useLanguage();
  const currency = useCurrency();
  const isOnsite = serviceType === 'onsite';

  const serviceCategoryOptions = [
    {
      value: 'consulting',
      label: t('serviceListing.category.consulting'),
      icon: 'bulb-outline' as const,
    },
    {
      value: 'drilling',
      label: t('serviceListing.category.drilling'),
      icon: 'construct-outline' as const,
    },
    {
      value: 'assayTesting',
      label: t('serviceListing.category.assayTesting'),
      icon: 'flask-outline' as const,
    },
    {
      value: 'transportLogistics',
      label: t('serviceListing.category.transportLogistics'),
      icon: 'car-outline' as const,
    },
    {
      value: 'equipmentRepair',
      label: t('serviceListing.category.equipmentRepair'),
      icon: 'build-outline' as const,
    },
    {
      value: 'environmentalPermitting',
      label: t('serviceListing.category.environmentalPermitting'),
      icon: 'leaf-outline' as const,
    },
    {
      value: 'other',
      label: t('serviceListing.category.other'),
      icon: 'ellipsis-horizontal-outline' as const,
    },
  ];

  const steps = [
    { key: 'details', label: t('serviceListing.detailsStep') },
    { key: 'media', label: t('serviceListing.mediaStep') },
    { key: 'review', label: t('serviceListing.reviewStep') },
  ];
  const lastStep = steps.length - 1;
  const [step, setStep] = React.useState(0);
  const [publishing, setPublishing] = React.useState(false);
  const addListing = useServiceListingsStore((state) => state.addListing);

  const [serviceCategory, setServiceCategory] = React.useState<string | null>(null);
  const [title, setTitle] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [yearsOfExperience, setYearsOfExperience] = React.useState('');
  const [price, setPrice] = React.useState('');
  const [serviceDate, setServiceDate] = React.useState<Date | null>(null);
  const [location, setLocation] = React.useState('');
  const [locationCoords, setLocationCoords] = React.useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [media, setMedia] = React.useState<ServiceMediaAsset[]>([]);
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
    serviceCategory && title.trim() && description.trim() && price.trim(),
  );
  const mediaValid =
    media.length > 0 && Boolean(serviceDate) && (!isOnsite || location.trim().length > 0);
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

  const serviceCategoryLabel = serviceCategoryOptions.find(
    (option) => option.value === serviceCategory,
  )?.label;

  const handlePublish = async () => {
    if (publishing) return;
    setPublishing(true);
    try {
      const persistedMedia = await persistListingMedia(media);
      const listing = await listingsApi.create({
        category: 'services',
        serviceType,
        serviceCategoryLabel: serviceCategoryLabel ?? '',
        title,
        description,
        yearsOfExperience,
        price,
        serviceDate: serviceDate ? serviceDate.getTime() : null,
        location: isOnsite ? location : '',
        media: persistedMedia,
        postedAs: useMarketplaceRoleStore.getState().role,
      });
      if (isServiceListing(listing)) addListing(listing);
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
    { label: t('serviceListing.serviceCategory'), value: serviceCategoryLabel ?? '' },
    { label: t('serviceListing.title'), value: title },
    { label: t('serviceListing.description'), value: description },
    {
      label: t('serviceListing.yearsOfExperience'),
      value: yearsOfExperience
        ? t('serviceListing.yearsOfExperienceValue', { years: yearsOfExperience })
        : '',
    },
    {
      label: t('serviceListing.price'),
      value: price ? `${currency.code} ${formatAmountWithCommas(price)}` : '',
    },
    {
      label: t('serviceListing.serviceDate'),
      value: serviceDate
        ? new Intl.DateTimeFormat(currentLanguage, {
            dateStyle: 'medium',
            timeStyle: 'short',
          }).format(serviceDate)
        : '',
    },
    ...(isOnsite ? [{ label: t('serviceListing.location'), value: location }] : []),
  ].filter((row) => (row.value ?? '').trim().length > 0);

  const photoMedia = media
    .filter((item) => item.kind === 'photo')
    .map((item) => ({ id: item.id, uri: item.uri, kind: 'photo' as const }));
  const documents = media.filter((item) => item.kind === 'document');

  return (
    <View style={styles.root}>
      <StatusBar style="light" />

      <AppTopBar
        left="back"
        variant="gold"
        title={isOnsite ? t('serviceListing.onsiteFormTitle') : t('serviceListing.onlineFormTitle')}
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
              label={t('serviceListing.serviceCategory')}
              placeholder={t('serviceListing.serviceCategoryPlaceholder')}
              sheetTitle={t('serviceListing.serviceCategory')}
              options={serviceCategoryOptions}
              value={serviceCategory}
              onChange={setServiceCategory}
              required
              searchable
              searchPlaceholder={t('serviceListing.searchServiceTypes')}
            />

            <FormInput
              label={t('serviceListing.title')}
              value={title}
              onChangeText={setTitle}
              placeholder={t('serviceListing.titlePlaceholder')}
              required
            />

            <FormInput
              label={t('serviceListing.description')}
              value={description}
              onChangeText={setDescription}
              placeholder={t('serviceListing.descriptionPlaceholder')}
              multiline
              numberOfLines={4}
              style={styles.descriptionInput}
              required
            />

            <FormInput
              label={t('serviceListing.yearsOfExperience')}
              value={yearsOfExperience}
              onChangeText={setYearsOfExperience}
              placeholder={t('serviceListing.yearsOfExperiencePlaceholder')}
              keyboardType="numeric"
            />

            <FormInput
              label={t('serviceListing.price')}
              value={price}
              onChangeText={setPrice}
              keyboardType="numeric"
              placeholder={currency.code}
              required
            />
          </View>
        ) : null}

        {step === 1 ? (
          <View style={styles.stepBlock}>
            <ServiceMediaUploader media={media} onChange={setMedia} />

            <DateTimeField
              label={t('serviceListing.serviceDate')}
              value={serviceDate}
              required
              placeholder={t('serviceListing.serviceDatePlaceholder')}
              onChange={setServiceDate}
            />

            {isOnsite ? (
              <LocationField
                label={t('serviceListing.location')}
                value={location}
                required
                loading={locationLoading}
                onChangeText={setLocation}
                onUseCurrentLocation={() => void handleUseCurrentLocation()}
                onSelectOnMap={handleSelectOnMap}
              />
            ) : null}
          </View>
        ) : null}

        {step === 2 ? (
          <View style={styles.stepBlock}>
            <EquipmentListingSummaryCard
              detailRows={detailRows}
              media={photoMedia}
              onChangeDetails={() => setStep(0)}
              onChangeMedia={() => setStep(1)}
            />
            <AttachmentsSection documents={documents} downloadable={false} />
            <Button
              label={t('serviceListing.publish')}
              onPress={handlePublish}
              loading={publishing}
              style={styles.publishButton}
            />
          </View>
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
  continueButton: {
    marginTop: spacing.sm,
  },
  publishButton: {
    marginTop: spacing.sm,
  },
});
