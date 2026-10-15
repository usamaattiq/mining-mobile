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
import { AppText } from '@/shared/components/AppText';
import { FormInput } from '@/shared/components/FormInput';
import { SelectField } from '@/shared/components/SelectField';
import { DateTimeField } from '@/shared/components/DateTimeField';
import {
  DurationSlider,
  formatAuctionDurationLabel,
} from '@/features/listings/components/DurationSlider';
import { LocationField } from '@/shared/components/LocationField';
import { cityFromLocationLabel } from '@/shared/utils/locationLabel';
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
import { listingsApi, isGoldListing } from '@/features/listings/api/listingsApi';
import { cacheListing } from '@/features/listings/utils/refreshListings';
import { persistListingMedia } from '@/features/listings/utils/persistListingMedia';
import { clampAuctionHours } from '@/features/listings/utils/listingExpiry';
import { matchSelectOption, cloneRepostMedia } from '@/features/listings/utils/matchSelectOption';
import { useCatalogOptions } from '@/features/listings/utils/useCatalogOptions';
import { useGoldListingsStore } from '@/store/goldListingsStore';
import { useMarketplaceRoleStore } from '@/store/marketplaceRoleStore';
import { useCurrency } from '@/shared/hooks/useCurrency';
import {
  formatAmountWithCommas,
  parsePositiveAmount,
  sanitizeGoldWeight,
  sanitizeStepPrice,
} from '@/shared/utils/formatAmount';
import {
  LISTING_DESCRIPTION_MAX_LENGTH,
  LISTING_TITLE_MAX_LENGTH,
} from '@/features/listings/constants/listingFieldLimits';
import type { ServiceMediaAsset } from '@/features/listings/types/serviceMedia.types';
import type { GoldListing } from '@/features/listings/types/goldListing.types';

type Props = NativeStackScreenProps<RootStackParamList, 'GoldListingForm'>;

export function GoldListingFormScreen({ navigation, route }: Props): React.ReactElement {
  const { t } = useTranslation(undefined, { i18n: appI18n });
  const { currentLanguage } = useLanguage();
  const currency = useCurrency();
  const role = useMarketplaceRoleStore((s) => s.role);
  const editingId = route.params?.editId;
  const sourceId = editingId ?? route.params?.repostId;

  // Gold auctions are supplier-only; bounce buyers who land here somehow.
  React.useEffect(() => {
    if (role === 'buyer' && !editingId) {
      navigation.goBack();
    }
  }, [editingId, role, navigation]);

  const weightAdornment = (
    <AppText weight="semibold" style={styles.weightAdornment}>
      {t('goldListing.weightUnit')}
    </AppText>
  );

  const purityOptions = useCatalogOptions('gold');

  const steps = [
    { key: 'details', label: t('goldListing.detailsStep') },
    { key: 'media', label: t('goldListing.mediaStep') },
    { key: 'review', label: t('goldListing.reviewStep') },
  ];
  const lastStep = steps.length - 1;
  const [step, setStep] = React.useState(0);
  const [publishing, setPublishing] = React.useState(false);
  const addListing = useGoldListingsStore((state) => state.addListing);
  const storedRepost = useGoldListingsStore((state) =>
    sourceId ? state.listings.find((item) => item.id === sourceId) : undefined,
  );
  const filledRepost = React.useRef(false);
  const [fetchedRepost, setFetchedRepost] = React.useState<GoldListing | undefined>(undefined);
  const sourceListing = storedRepost ?? fetchedRepost;

  const [title, setTitle] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [weight, setWeight] = React.useState('');
  const [purity, setPurity] = React.useState<string | null>(null);
  const [price, setPrice] = React.useState('');
  const [auctionStartDate, setAuctionStartDate] = React.useState<Date | null>(() => new Date());
  const [durationHours, setDurationHours] = React.useState(24);
  const [location, setLocation] = React.useState('');
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
      if (!cancelled && isGoldListing(listing)) setFetchedRepost(listing);
    });
    return () => {
      cancelled = true;
    };
  }, [sourceId, storedRepost]);

  React.useEffect(() => {
    if (!sourceListing || filledRepost.current) return;
    filledRepost.current = true;
    setTitle(sourceListing.title.slice(0, LISTING_TITLE_MAX_LENGTH));
    setDescription((sourceListing.description ?? '').slice(0, LISTING_DESCRIPTION_MAX_LENGTH));
    setWeight(sanitizeGoldWeight(sourceListing.weight ?? ''));
    setPurity(
      matchSelectOption(purityOptions, sourceListing.purityLabel) ??
        (sourceListing.purityLabel.trim() || null),
    );
    setPrice(sourceListing.price ?? '');
    if (editingId) {
      const end = sourceListing.auctionEndDate ?? sourceListing.rfq?.expiresAt ?? null;
      if (end && end > Date.now()) {
        setAuctionStartDate(new Date());
        setDurationHours(clampAuctionHours((end - Date.now()) / 3_600_000));
      } else {
        setAuctionStartDate(new Date());
        setDurationHours(24);
      }
    } else {
      setAuctionStartDate(new Date());
      setDurationHours(24);
    }
    setLocation(sourceListing.location ?? '');
    setMedia(
      cloneRepostMedia(
        (sourceListing.media ?? []).filter(
          (item): item is ServiceMediaAsset => item.kind === 'photo' || item.kind === 'document',
        ),
      ),
    );
  }, [editingId, purityOptions, sourceListing]);

  React.useEffect(() => {
    if (!sourceListing || purityOptions.length === 0) return;
    const matched = matchSelectOption(purityOptions, sourceListing.purityLabel);
    if (matched) setPurity(matched);
  }, [purityOptions, sourceListing]);

  const handleUseCurrentLocation = React.useCallback(async () => {
    const selection = await getCurrentLocation();
    if (!selection) return;
    setLocation(selection.label);
    setLocationCoords({ latitude: selection.latitude, longitude: selection.longitude });
  }, [getCurrentLocation]);

  useAutoCurrentLocation(step === 1, location.trim().length > 0, handleUseCurrentLocation);

  const handleSelectOnMap = () => {
    openMapPickerForSelection((selection) => {
      setLocation(selection.label);
      setLocationCoords({ latitude: selection.latitude, longitude: selection.longitude });
    }, locationCoords);
  };

  const detailsValid = Boolean(
    title.trim() &&
    description.trim() &&
    parsePositiveAmount(weight) &&
    purity &&
    parsePositiveAmount(price),
  );
  const mediaValid = media.length > 0 && Boolean(auctionStartDate) && location.trim().length > 0;
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

  const purityLabel = purityOptions.find((option) => option.value === purity)?.label;

  const handlePublish = async () => {
    if (publishing) return;
    if (editingId && !sourceListing) return;
    const start =
      !auctionStartDate || auctionStartDate.getTime() <= Date.now() ? new Date() : auctionStartDate;
    setPublishing(true);
    try {
      const persistedMedia = await persistListingMedia(media);
      const body = {
        category: 'gold' as const,
        title,
        description,
        weight: weight.replace(/\.$/, ''),
        purityLabel: purity ?? '',
        price,
        auctionStartDate: start.getTime(),
        auctionEndDate: start.getTime() + durationHours * 60 * 60 * 1000,
        location,
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
      if (isGoldListing(listing)) addListing(listing);
      navigation.reset({
        index: 1,
        routes: [
          { name: 'Dashboard', params: { screen: 'Requests', params: { category: 'gold' } } },
          {
            name: 'Welcome',
            params: { next: 'listings', category: 'gold', listingId: listing.id },
          },
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
    { label: t('goldListing.fieldTitle'), value: title },
    { label: t('goldListing.fieldDescription'), value: description },
    {
      label: t('goldListing.fieldWeight'),
      value: weight ? t('goldListing.weightValue', { weight }) : '',
    },
    { label: t('goldListing.fieldPurity'), value: purityLabel ?? '' },
    {
      label: t('goldListing.price', { currency: currency.code }),
      value: price ? `${currency.code} ${formatAmountWithCommas(price)}` : '',
    },
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
    {
      label: t('goldListing.fieldLocation'),
      value: cityFromLocationLabel(location) || location,
    },
  ].filter((row) => (row.value ?? '').trim().length > 0);

  const photoMedia = media
    .filter((item) => item.kind === 'photo')
    .map((item) => ({ id: item.id, uri: item.uri, kind: 'photo' as const }));
  const documents = media.filter((item) => item.kind === 'document');

  if (role === 'buyer' && !editingId) {
    return <View style={styles.root} />;
  }

  return (
    <View style={styles.root}>
      <StatusBar style="light" />

      <AppTopBar
        left="back"
        variant="gold"
        title={editingId ? t('goldListing.editFormTitle') : t('goldListing.formTitle')}
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
            <FormInput
              label={t('goldListing.fieldTitle')}
              value={title}
              onChangeText={setTitle}
              placeholder={t('goldListing.titlePlaceholder')}
              required
              maxLength={LISTING_TITLE_MAX_LENGTH}
              showCounter
            />

            <FormInput
              label={t('goldListing.fieldDescription')}
              value={description}
              onChangeText={setDescription}
              placeholder={t('goldListing.descriptionPlaceholder')}
              multiline
              numberOfLines={4}
              style={styles.descriptionInput}
              required
              maxLength={LISTING_DESCRIPTION_MAX_LENGTH}
              showCounter
            />

            <View style={styles.rowFields}>
              <View style={styles.rowField}>
                <FormInput
                  label={t('goldListing.fieldWeight')}
                  value={weight}
                  onChangeText={(value) => setWeight(sanitizeGoldWeight(value))}
                  placeholder={t('goldListing.weightPlaceholder')}
                  keyboardType="decimal-pad"
                  rightAdornment={weightAdornment}
                  required
                />
              </View>
              <View style={styles.rowField}>
                <SelectField
                  label={t('goldListing.fieldPurity')}
                  placeholder={t('goldListing.purityPlaceholder')}
                  sheetTitle={t('goldListing.fieldPurity')}
                  options={purityOptions}
                  value={purity}
                  onChange={setPurity}
                  required
                />
              </View>
            </View>

            <FormInput
              label={t('goldListing.price', { currency: currency.code })}
              value={price}
              onChangeText={(value) => setPrice(sanitizeStepPrice(value))}
              keyboardType="numeric"
              placeholder={currency.code}
              required
              error={
                price && !parsePositiveAmount(price) ? t('common.priceGreaterThanZero') : undefined
              }
            />
          </View>
        ) : null}

        {step === 1 ? (
          <View style={styles.stepBlock}>
            <ServiceMediaUploader media={media} onChange={setMedia} />

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
              allowOneMinute
            />

            <LocationField
              label={t('goldListing.fieldLocation')}
              value={location}
              cityOnly
              required
              loading={locationLoading}
              onChangeText={setLocation}
              onUseCurrentLocation={() => void handleUseCurrentLocation()}
              onSelectOnMap={handleSelectOnMap}
            />
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
              label={editingId ? t('goldListing.update') : t('goldListing.publish')}
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
  descriptionInput: {
    minHeight: 96,
    paddingTop: spacing.sm,
    textAlignVertical: 'top',
  },
  rowFields: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  rowField: {
    flex: 1,
  },
  weightAdornment: {
    fontSize: 15,
    color: palette.muted,
  },
  continueButton: {
    marginTop: spacing.sm,
  },
  publishButton: {
    marginTop: spacing.sm,
  },
});
