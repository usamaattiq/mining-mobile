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
import { DurationSlider, formatAuctionDurationLabel } from '@/features/listings/components/DurationSlider';
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
import { listingsApi, isGoldListing } from '@/features/listings/api/listingsApi';
import { persistListingMedia } from '@/features/listings/utils/persistListingMedia';
import { matchSelectOption, cloneRepostMedia } from '@/features/listings/utils/matchSelectOption';
import { useGoldListingsStore } from '@/store/goldListingsStore';
import { useMarketplaceRoleStore } from '@/store/marketplaceRoleStore';
import { useCurrency } from '@/shared/hooks/useCurrency';
import { formatAmountWithCommas } from '@/shared/utils/formatAmount';
import type { ServiceMediaAsset } from '@/features/listings/types/serviceMedia.types';
import type { GoldListing } from '@/features/listings/types/goldListing.types';

type Props = NativeStackScreenProps<RootStackParamList, 'GoldListingForm'>;

export function GoldListingFormScreen({ navigation, route }: Props): React.ReactElement {
  const { t } = useTranslation(undefined, { i18n: appI18n });
  const { currentLanguage } = useLanguage();
  const currency = useCurrency();
  const role = useMarketplaceRoleStore((s) => s.role);

  // Gold auctions are supplier-only; bounce buyers who land here somehow.
  React.useEffect(() => {
    if (role === 'buyer') {
      navigation.goBack();
    }
  }, [role, navigation]);

  const weightAdornment = (
    <AppText weight="semibold" style={styles.weightAdornment}>
      {t('goldListing.weightUnit')}
    </AppText>
  );

  const purityOptions = [
    ...Array.from({ length: 24 - 10 + 1 }, (_, index) => 24 - index).map((karat) => ({
      value: `${karat}k`,
      label: t('goldListing.karatValue', { karat }),
    })),
    { value: 'other', label: t('goldListing.purityOptions.other') },
  ];

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
    route.params?.repostId
      ? state.listings.find((item) => item.id === route.params?.repostId)
      : undefined,
  );
  const filledRepost = React.useRef(false);
  const [fetchedRepost, setFetchedRepost] = React.useState<GoldListing | undefined>(undefined);
  const sourceListing = storedRepost ?? fetchedRepost;

  const [title, setTitle] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [weight, setWeight] = React.useState('');
  const [purity, setPurity] = React.useState<string | null>(null);
  const [price, setPrice] = React.useState('');
  const [auctionStartDate, setAuctionStartDate] = React.useState<Date | null>(null);
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
    const id = route.params?.repostId;
    if (!id || storedRepost) return;
    let cancelled = false;
    void listingsApi.get(id).then((listing) => {
      if (!cancelled && isGoldListing(listing)) setFetchedRepost(listing);
    });
    return () => {
      cancelled = true;
    };
  }, [route.params?.repostId, storedRepost]);

  React.useEffect(() => {
    if (!sourceListing || filledRepost.current) return;
    filledRepost.current = true;
    setTitle(sourceListing.title);
    setDescription(sourceListing.description ?? '');
    setWeight(sourceListing.weight ?? '');
    setPurity(matchSelectOption(purityOptions, sourceListing.purityLabel));
    setPrice(sourceListing.price ?? '');
    setAuctionStartDate(new Date());
    setDurationHours(24);
    setLocation(sourceListing.location ?? '');
    setMedia(
      cloneRepostMedia(
        (sourceListing.media ?? []).filter(
          (item): item is ServiceMediaAsset => item.kind === 'photo' || item.kind === 'document',
        ),
      ),
    );
  }, [purityOptions, sourceListing]);

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
    title.trim() && description.trim() && weight.trim() && purity && price.trim(),
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
    setPublishing(true);
    try {
      const persistedMedia = await persistListingMedia(media);
      const listing = await listingsApi.create({
        category: 'gold',
        title,
        description,
        weight,
        purityLabel: purityLabel ?? '',
        price,
        auctionEndDate:
          auctionStartDate != null
            ? auctionStartDate.getTime() + durationHours * 60 * 60 * 1000
            : null,
        location,
        media: persistedMedia,
        postedAs: useMarketplaceRoleStore.getState().role,
      });
      if (isGoldListing(listing)) addListing(listing);
      navigation.reset({
        index: 1,
        routes: [
          { name: 'Dashboard', params: { screen: 'Requests', params: { category: 'gold' } } },
          { name: 'Welcome', params: { next: 'listings', category: 'gold' } },
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
    { label: t('goldListing.title'), value: title },
    { label: t('goldListing.description'), value: description },
    {
      label: t('goldListing.weight'),
      value: weight ? t('goldListing.weightValue', { weight }) : '',
    },
    { label: t('goldListing.purity'), value: purityLabel ?? '' },
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
    { label: t('goldListing.location'), value: location },
  ].filter((row) => (row.value ?? '').trim().length > 0);

  const photoMedia = media
    .filter((item) => item.kind === 'photo')
    .map((item) => ({ id: item.id, uri: item.uri, kind: 'photo' as const }));
  const documents = media.filter((item) => item.kind === 'document');

  if (role === 'buyer') {
    return <View style={styles.root} />;
  }

  return (
    <View style={styles.root}>
      <StatusBar style="light" />

      <AppTopBar
        left="back"
        variant="gold"
        title={t('goldListing.formTitle')}
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
            <FormInput
              label={t('goldListing.title')}
              value={title}
              onChangeText={setTitle}
              placeholder={t('goldListing.titlePlaceholder')}
              required
            />

            <FormInput
              label={t('goldListing.description')}
              value={description}
              onChangeText={setDescription}
              placeholder={t('goldListing.descriptionPlaceholder')}
              multiline
              numberOfLines={4}
              style={styles.descriptionInput}
              required
            />

            <View style={styles.rowFields}>
              <View style={styles.rowField}>
                <FormInput
                  label={t('goldListing.weight')}
                  value={weight}
                  onChangeText={setWeight}
                  placeholder={t('goldListing.weightPlaceholder')}
                  keyboardType="numeric"
                  rightAdornment={weightAdornment}
                  required
                />
              </View>
              <View style={styles.rowField}>
                <SelectField
                  label={t('goldListing.purity')}
                  placeholder={t('goldListing.purityPlaceholder')}
                  sheetTitle={t('goldListing.purity')}
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
              label={t('goldListing.auctionStartDate')}
              value={auctionStartDate}
              required
              placeholder={t('goldListing.auctionStartDatePlaceholder')}
              onChange={setAuctionStartDate}
            />

            <DurationSlider
              label={t('goldListing.auctionDuration')}
              value={durationHours}
              onChange={setDurationHours}
            />

            <LocationField
              label={t('goldListing.location')}
              value={location}
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
              label={t('goldListing.publish')}
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
