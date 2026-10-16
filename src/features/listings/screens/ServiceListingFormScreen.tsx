import React from 'react';
import { StyleSheet, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { i18n as appI18n } from '@/i18n';
import { useLanguage } from '@/i18n/hooks/useLanguage';
import { AppText } from '@/shared/components/AppText';
import { OfferChoiceCard } from '@/features/listings/components/OfferChoiceCard';
import type { RootStackParamList } from '@/navigation/types';
import { AppTopBar } from '@/shared/components/AppTopBar';
import { FormInput } from '@/shared/components/FormInput';
import { CounterField } from '@/shared/components/CounterField';
import { SelectField } from '@/shared/components/SelectField';
import { DateTimeField } from '@/shared/components/DateTimeField';
import { defaultListingEnd, expiryHoursUntil } from '@/features/listings/utils/listingExpiry';
import { LocationField } from '@/shared/components/LocationField';
import { ServicePlacesField } from '@/features/listings/components/ServicePlacesField';
import type { ServiceAreaPlace } from '@/shared/utils/location-map-geocode';
import { useAutoCurrentLocation } from '@/shared/hooks/useAutoCurrentLocation';
import { useLocationMapPicker } from '@/shared/hooks/useLocationMapPicker';
import { Button } from '@/shared/components/Button';
import { ListingStepper } from '@/features/listings/components/ListingStepper';
import { ServiceMediaUploader } from '@/features/listings/components/ServiceMediaUploader';
import { EquipmentListingSummaryCard } from '@/features/listings/components/EquipmentListingSummaryCard';
import { AttachmentsSection } from '@/features/listings/components/AttachmentsSection';
import { palette, radius, spacing } from '@/theme';
import { showAppAlert } from '@/shared/services/appAlert';
import { ApiError } from '@/shared/services/api';
import { localizeApiMessage } from '@/shared/utils/localizeApiMessage';
import { listingsApi, isServiceListing } from '@/features/listings/api/listingsApi';
import { cacheListing } from '@/features/listings/utils/refreshListings';
import { persistListingMedia } from '@/features/listings/utils/persistListingMedia';
import { matchSelectOption, cloneRepostMedia } from '@/features/listings/utils/matchSelectOption';
import { useCatalogOptions } from '@/features/listings/utils/useCatalogOptions';
import {
  serviceTypeFlags,
  serviceTypeFromFlags,
  serviceTypeLabels,
  resolveServicePrices,
} from '@/features/listings/utils/serviceType';
import { useServiceListingsStore } from '@/store/serviceListingsStore';
import { useMarketplaceRoleStore } from '@/store/marketplaceRoleStore';
import { useCurrency } from '@/shared/hooks/useCurrency';
import {
  formatAmountWithCommas,
  parsePositiveAmount,
  sanitizeStepPrice,
} from '@/shared/utils/formatAmount';
import {
  LISTING_DESCRIPTION_MAX_LENGTH,
  LISTING_TITLE_MAX_LENGTH,
} from '@/features/listings/constants/listingFieldLimits';
import type { ServiceMediaAsset } from '@/features/listings/types/serviceMedia.types';
import type { ServiceListing } from '@/features/listings/types/serviceListing.types';

type Props = NativeStackScreenProps<RootStackParamList, 'ServiceListingForm'>;

export function ServiceListingFormScreen({ navigation, route }: Props): React.ReactElement {
  const { t } = useTranslation(undefined, { i18n: appI18n });
  const { currentLanguage } = useLanguage();
  const currency = useCurrency();
  const editingId = route.params?.editId;
  const sourceId = editingId ?? route.params?.repostId;
  const roleIsBuyer = useMarketplaceRoleStore((state) => state.role === 'buyer');
  const [onsite, setOnsite] = React.useState(false);
  const [online, setOnline] = React.useState(false);
  const serviceType = serviceTypeFromFlags(onsite, online);

  const serviceCategoryOptions = useCatalogOptions('services');

  const steps = [
    { key: 'type', label: t('serviceListing.typeStep') },
    { key: 'details', label: t('serviceListing.detailsStep') },
    { key: 'media', label: t('serviceListing.mediaStep') },
    { key: 'review', label: t('serviceListing.reviewStep') },
  ];
  const lastStep = steps.length - 1;
  const [step, setStep] = React.useState(0);
  const [placesFieldFocused, setPlacesFieldFocused] = React.useState(false);
  const [publishing, setPublishing] = React.useState(false);
  const addListing = useServiceListingsStore((state) => state.addListing);
  const storedRepost = useServiceListingsStore((state) =>
    sourceId ? state.listings.find((item) => item.id === sourceId) : undefined,
  );
  const filledRepost = React.useRef(false);
  const originalListedUntil = React.useRef<number | null>(null);
  const [fetchedRepost, setFetchedRepost] = React.useState<ServiceListing | undefined>(undefined);
  const sourceListing = storedRepost ?? fetchedRepost;
  const isBuyer = editingId ? sourceListing?.postedAs === 'buyer' : roleIsBuyer;

  const [serviceCategory, setServiceCategory] = React.useState<string | null>(null);
  const [unitOptions, setUnitOptions] = React.useState<{ value: string; label: string }[]>([]);
  const [unitLabel, setUnitLabel] = React.useState<string | null>(null);
  const [unitPrice, setUnitPrice] = React.useState('');

  React.useEffect(() => {
    void listingsApi
      .units()
      .then((result) =>
        setUnitOptions(
          result.items.map((item) => ({
            value: item.name,
            label: currentLanguage.startsWith('ar') && item.nameAr ? item.nameAr : item.name,
          })),
        ),
      )
      .catch(() => undefined);
  }, [currentLanguage]);
  const [title, setTitle] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [yearsOfExperience, setYearsOfExperience] = React.useState(1);
  const [onsitePrice, setOnsitePrice] = React.useState('');
  const [onlinePrice, setOnlinePrice] = React.useState('');
  const [listedUntil, setListedUntil] = React.useState(defaultListingEnd);
  const [location, setLocation] = React.useState('');
  const [places, setPlaces] = React.useState<ServiceAreaPlace[]>([]);
  const offerPlaces = !isBuyer && onsite;
  const [locationCoords, setLocationCoords] = React.useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [media, setMedia] = React.useState<ServiceMediaAsset[]>([]);
  const { locationLoading, getCurrentLocation, openMapPickerForSelection, mapPickerSheet } =
    useLocationMapPicker();

  React.useEffect(() => {
    const id = sourceId;
    if (!id || storedRepost) return;
    let cancelled = false;
    void listingsApi.get(id).then((listing) => {
      if (!cancelled && isServiceListing(listing)) setFetchedRepost(listing);
    });
    return () => {
      cancelled = true;
    };
  }, [sourceId, storedRepost]);

  React.useEffect(() => {
    if (!sourceListing || filledRepost.current) return;
    filledRepost.current = true;
    const flags = serviceTypeFlags(sourceListing.serviceType);
    setOnsite(flags.onsite);
    setOnline(flags.online);
    setServiceCategory(
      matchSelectOption(serviceCategoryOptions, sourceListing.serviceCategoryLabel) ??
        (sourceListing.serviceCategoryLabel.trim() || null),
    );
    setUnitLabel(sourceListing.unitLabel?.trim() || null);
    setUnitPrice(sanitizeStepPrice(sourceListing.unitPrice ?? ''));
    setTitle(sourceListing.title.slice(0, LISTING_TITLE_MAX_LENGTH));
    setDescription((sourceListing.description ?? '').slice(0, LISTING_DESCRIPTION_MAX_LENGTH));
    setYearsOfExperience(Math.max(Number(sourceListing.yearsOfExperience) || 1, 1));
    const prices = resolveServicePrices(sourceListing);
    setOnsitePrice(isBuyer ? '' : sanitizeStepPrice(prices.onsitePrice));
    setOnlinePrice(isBuyer ? '' : sanitizeStepPrice(prices.onlinePrice));
    setLocation(sourceListing.location ?? '');
    if (flags.onsite && sourceListing.postedAs !== 'buyer') {
      setPlaces(
        (sourceListing.location ?? '')
          .split(' · ')
          .map((label) => label.trim())
          .filter(Boolean)
          .map((label) => ({
            id: label,
            label,
            name: label.split(',')[0]?.trim() || label,
            kind: 'city' as const,
            parentCity: '',
          })),
      );
    }
    if (editingId && sourceListing.rfq?.expiresAt) {
      originalListedUntil.current = sourceListing.rfq.expiresAt;
      setListedUntil(new Date(sourceListing.rfq.expiresAt));
    }
    setMedia(
      cloneRepostMedia(
        (sourceListing.media ?? []).filter(
          (item): item is ServiceMediaAsset => item.kind === 'photo' || item.kind === 'document',
        ),
      ),
    );
  }, [editingId, isBuyer, serviceCategoryOptions, sourceListing]);

  React.useEffect(() => {
    if (!sourceListing || serviceCategoryOptions.length === 0) return;
    const matched = matchSelectOption(serviceCategoryOptions, sourceListing.serviceCategoryLabel);
    if (matched) setServiceCategory(matched);
  }, [serviceCategoryOptions, sourceListing]);

  const handleUseCurrentLocation = React.useCallback(async () => {
    const selection = await getCurrentLocation();
    if (!selection) return;
    setLocation(selection.label);
    setLocationCoords({ latitude: selection.latitude, longitude: selection.longitude });
  }, [getCurrentLocation]);

  useAutoCurrentLocation(
    step === 2 && !offerPlaces,
    location.trim().length > 0,
    handleUseCurrentLocation,
  );

  const handleSelectOnMap = () => {
    openMapPickerForSelection((selection) => {
      setLocation(selection.label);
      setLocationCoords({ latitude: selection.latitude, longitude: selection.longitude });
    }, locationCoords);
  };

  const detailsValid = Boolean(
    serviceType &&
    serviceCategory &&
    title.trim() &&
    description.trim() &&
    (isBuyer ||
      (Boolean(unitLabel) &&
        (onsite ? Boolean(parsePositiveAmount(onsitePrice)) : true) &&
        (online ? Boolean(parsePositiveAmount(onlinePrice)) : true))),
    (!isBuyer || !unitLabel || Boolean(parsePositiveAmount(unitPrice))),
  );
  const offeredLocation = offerPlaces
    ? places
        .map((place) => (place.name || place.label).trim())
        .filter(Boolean)
        .join(' · ')
    : location;
  const mediaValid = (isBuyer || media.length > 0) && offeredLocation.trim().length > 0;
  const canGoNext =
    step === 0 ? Boolean(serviceType) : step === 1 ? detailsValid : step === 2 ? mediaValid : true;

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
  const unitDisplay = unitLabel
    ? (unitOptions.find((option) => option.value === unitLabel)?.label ?? unitLabel)
    : '';
  const onsitePriceLabel = t(
    unitDisplay ? 'serviceListing.onsitePricePerUnit' : 'serviceListing.onsitePrice',
    { currency: currency.code, unit: unitDisplay },
  );
  const onlinePriceLabel = t(
    unitDisplay ? 'serviceListing.onlinePricePerUnit' : 'serviceListing.onlinePrice',
    { currency: currency.code, unit: unitDisplay },
  );

  const handlePublish = async () => {
    if (publishing || !serviceType) return;
    if (editingId && !sourceListing) return;
    if (listedUntil.getTime() <= Date.now()) {
      const keptOriginal = originalListedUntil.current === listedUntil.getTime();
      if (!keptOriginal) {
        showAppAlert(
          t('common.error'),
          t(isBuyer ? 'serviceListing.listedUntilPastRequest' : 'serviceListing.listedUntilPast'),
        );
        return;
      }
    }
    setPublishing(true);
    try {
      const persistedMedia = await persistListingMedia(media);
      const body = {
        category: 'services' as const,
        serviceType,
        serviceCategoryLabel: serviceCategory ?? '',
        title,
        description,
        yearsOfExperience: isBuyer ? '' : String(yearsOfExperience),
        onsitePrice: isBuyer || !onsite ? '' : onsitePrice.replace(/,/g, ''),
        onlinePrice: isBuyer || !online ? '' : onlinePrice.replace(/,/g, ''),
        price: isBuyer ? '' : (onsite ? onsitePrice : onlinePrice).replace(/,/g, ''),
        unitLabel: unitLabel ?? '',
        unitPrice: isBuyer && unitLabel ? unitPrice.replace(/,/g, '') : '',
        serviceDate: null,
        expiryHours: expiryHoursUntil(listedUntil),
        location: offeredLocation,
        media: persistedMedia,
        postedAs: editingId
          ? (sourceListing?.postedAs ?? 'supplier')
          : useMarketplaceRoleStore.getState().role,
      };
      const listing = editingId
        ? await listingsApi.update(editingId, body)
        : await listingsApi.create(body);
      if (editingId) {
        cacheListing(listing);
        navigation.goBack();
        return;
      }
      if (isServiceListing(listing)) addListing(listing);
      navigation.reset({
        index: 1,
        routes: [
          { name: 'Dashboard', params: { screen: 'Requests', params: { category: 'services' } } },
          {
            name: 'Welcome',
            params: { next: 'listings', category: 'services', listingId: listing.id },
          },
        ],
      });
    } catch (error) {
      showAppAlert(
        t('common.error'),
        error instanceof ApiError ? localizeApiMessage(error.message) : t('common.error'),
      );
    } finally {
      setPublishing(false);
    }
  };

  const detailRows = [
    {
      label: t(isBuyer ? 'serviceListing.fieldTitleRequest' : 'serviceListing.fieldTitle'),
      value: title,
    },
    {
      label: t(
        isBuyer ? 'serviceListing.fieldDescriptionRequest' : 'serviceListing.fieldDescription',
      ),
      value: description,
    },
    {
      label: t(
        isBuyer
          ? 'serviceListing.fieldServiceCategoryRequest'
          : 'serviceListing.fieldServiceCategory',
      ),
      value: serviceCategoryLabel ?? '',
    },
    ...(unitLabel
      ? [
          {
            label: t('serviceListing.fieldUnit'),
            value: unitDisplay,
          },
          ...(isBuyer
            ? [
                {
                  label: t('serviceListing.fieldUnitPrice', { unit: unitDisplay }),
                  value: unitPrice ? `${currency.code} ${formatAmountWithCommas(unitPrice)}` : '',
                },
              ]
            : []),
        ]
      : []),
    ...(isBuyer
      ? []
      : [
          {
            label: t('serviceListing.yearsOfExperience'),
            value: t('serviceListing.yearsOfExperienceValue', { years: yearsOfExperience }),
          },
        ]),
    {
      label: t('serviceListing.type'),
      value: serviceTypeLabels(t, serviceType).join(' / '),
    },
    ...(isBuyer
      ? []
      : [
          {
            label: onsitePriceLabel,
            value:
              onsite && onsitePrice
                ? `${currency.code} ${formatAmountWithCommas(onsitePrice)}`
                : '',
          },
          {
            label: onlinePriceLabel,
            value:
              online && onlinePrice
                ? `${currency.code} ${formatAmountWithCommas(onlinePrice)}`
                : '',
          },
        ]),
    {
      label: t(isBuyer ? 'serviceListing.fieldLocationRequest' : 'serviceListing.fieldLocation'),
      value: offeredLocation,
    },
    {
      label: t(isBuyer ? 'serviceListing.listedUntilRequest' : 'serviceListing.listedUntil'),
      value: new Intl.DateTimeFormat(currentLanguage, {
        dateStyle: 'medium',
        timeStyle: 'short',
      }).format(listedUntil),
    },
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
        title={
          editingId
            ? t(isBuyer ? 'serviceListing.editRequestFormTitle' : 'serviceListing.editFormTitle')
            : isBuyer
              ? t('serviceListing.requestFormTitle')
              : t('serviceListing.formTitle')
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
        bottomOffset={placesFieldFocused ? 260 : 96}
        extraKeyboardSpace={0}
        disableScrollOnKeyboardHide
      >
        {step === 0 ? (
          <View style={styles.stepBlock}>
            <AppText weight="bold" style={styles.offerHeading}>
              {t(isBuyer ? 'serviceListing.offerHeadingRequest' : 'serviceListing.offerHeading')}
            </AppText>
            <OfferChoiceCard
              selected={onsite}
              icon="location-outline"
              title={t('serviceListing.onsite')}
              subtitle={t(
                isBuyer ? 'serviceListing.onsiteRequestSubtitle' : 'serviceListing.onsiteSubtitle',
              )}
              onPress={() => setOnsite((value) => !value)}
            />
            <OfferChoiceCard
              selected={online}
              icon="globe-outline"
              title={t('serviceListing.online')}
              subtitle={t(
                isBuyer ? 'serviceListing.onlineRequestSubtitle' : 'serviceListing.onlineSubtitle',
              )}
              onPress={() => setOnline((value) => !value)}
            />
          </View>
        ) : null}

        {step === 1 ? (
          <View style={styles.stepBlock}>
            <FormInput
              label={t(isBuyer ? 'serviceListing.fieldTitleRequest' : 'serviceListing.fieldTitle')}
              value={title}
              onChangeText={setTitle}
              placeholder={t(
                isBuyer
                  ? 'serviceListing.titlePlaceholderRequest'
                  : 'serviceListing.titlePlaceholder',
              )}
              required
              maxLength={LISTING_TITLE_MAX_LENGTH}
              showCounter
            />

            <FormInput
              label={t(
                isBuyer
                  ? 'serviceListing.fieldDescriptionRequest'
                  : 'serviceListing.fieldDescription',
              )}
              value={description}
              onChangeText={setDescription}
              placeholder={t(
                isBuyer
                  ? 'serviceListing.descriptionPlaceholderRequest'
                  : 'serviceListing.descriptionPlaceholder',
              )}
              multiline
              numberOfLines={4}
              style={styles.descriptionInput}
              required
              maxLength={LISTING_DESCRIPTION_MAX_LENGTH}
              showCounter
            />

            <SelectField
              label={t(
                isBuyer
                  ? 'serviceListing.fieldServiceCategoryRequest'
                  : 'serviceListing.fieldServiceCategory',
              )}
              placeholder={t('serviceListing.serviceCategoryPlaceholder')}
              sheetTitle={t(
                isBuyer
                  ? 'serviceListing.fieldServiceCategoryRequest'
                  : 'serviceListing.fieldServiceCategory',
              )}
              options={serviceCategoryOptions}
              value={serviceCategory}
              onChange={setServiceCategory}
              required
              searchable
              tallWhenMany
              searchPlaceholder={t('serviceListing.searchServiceTypes')}
            />

            <SelectField
              label={t(isBuyer ? 'serviceListing.fieldUnitRequest' : 'serviceListing.fieldUnit')}
              placeholder={t('serviceListing.unitPlaceholder')}
              sheetTitle={t('serviceListing.fieldUnit')}
              options={unitOptions}
              value={unitLabel}
              onChange={(next) => {
                setUnitLabel(next);
                if (!next) setUnitPrice('');
              }}
              required={!isBuyer}
            />
            {isBuyer && unitLabel ? (
              <FormInput
                label={t('serviceListing.fieldUnitPrice', { unit: unitDisplay })}
                value={unitPrice}
                onChangeText={(value) => setUnitPrice(sanitizeStepPrice(value))}
                keyboardType="numeric"
                placeholder={currency.code}
                required
                error={
                  unitPrice && !parsePositiveAmount(unitPrice)
                    ? t('common.priceGreaterThanZero')
                    : undefined
                }
              />
            ) : null}

            {isBuyer ? null : (
              <CounterField
                label={t('serviceListing.yearsOfExperience')}
                value={yearsOfExperience}
                onChange={setYearsOfExperience}
                min={1}
                max={80}
              />
            )}

            {isBuyer || !unitLabel ? null : (
              <>
                {onsite ? (
                  <FormInput
                    label={onsitePriceLabel}
                    value={onsitePrice}
                    onChangeText={(value) => setOnsitePrice(sanitizeStepPrice(value))}
                    keyboardType="numeric"
                    placeholder={currency.code}
                    required
                    error={
                      onsitePrice && !parsePositiveAmount(onsitePrice)
                        ? t('common.priceGreaterThanZero')
                        : undefined
                    }
                  />
                ) : null}
                {online ? (
                  <FormInput
                    label={onlinePriceLabel}
                    value={onlinePrice}
                    onChangeText={(value) => setOnlinePrice(sanitizeStepPrice(value))}
                    keyboardType="numeric"
                    placeholder={currency.code}
                    required
                    error={
                      onlinePrice && !parsePositiveAmount(onlinePrice)
                        ? t('common.priceGreaterThanZero')
                        : undefined
                    }
                  />
                ) : null}
              </>
            )}
          </View>
        ) : null}

        {step === 2 ? (
          <View style={styles.stepBlock}>
            <ServiceMediaUploader
              media={media}
              onChange={setMedia}
              required={!isBuyer}
              isRequest={isBuyer}
            />

            <DateTimeField
              label={t(
                isBuyer ? 'serviceListing.listedUntilRequest' : 'serviceListing.listedUntil',
              )}
              value={listedUntil}
              required
              minimumDate={new Date()}
              placeholder={t('serviceListing.listedUntilPlaceholder')}
              onChange={setListedUntil}
            />

            {offerPlaces ? (
              <ServicePlacesField
                label={t('serviceListing.fieldLocation')}
                places={places}
                onChange={setPlaces}
                required
                onFocusChange={setPlacesFieldFocused}
              />
            ) : (
              <LocationField
                label={t(
                  isBuyer ? 'serviceListing.fieldLocationRequest' : 'serviceListing.fieldLocation',
                )}
                value={location}
                required
                loading={locationLoading}
                onChangeText={setLocation}
                onUseCurrentLocation={() => void handleUseCurrentLocation()}
                onSelectOnMap={handleSelectOnMap}
              />
            )}
          </View>
        ) : null}

        {step === 3 ? (
          <View style={styles.stepBlock}>
            <EquipmentListingSummaryCard
              detailRows={detailRows}
              media={photoMedia}
              onChangeDetails={() => setStep(1)}
              onChangeMedia={() => setStep(2)}
            />
            <AttachmentsSection documents={documents} downloadable={false} />
            <Button
              label={
                editingId
                  ? t(isBuyer ? 'serviceListing.updateRequest' : 'serviceListing.update')
                  : t(isBuyer ? 'serviceListing.publishRequest' : 'serviceListing.publish')
              }
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
    overflow: 'hidden',
  },
  content: {
    padding: spacing.lg,
    gap: spacing.md,
    paddingBottom: spacing.xxl,
  },
  stepBlock: {
    gap: spacing.sm,
  },
  offerHeading: {
    fontSize: 20,
    lineHeight: 26,
    color: palette.charcoal,
    marginBottom: spacing.md,
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
