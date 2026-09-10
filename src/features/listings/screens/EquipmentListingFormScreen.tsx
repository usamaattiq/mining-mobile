import React from 'react';
import { StyleSheet, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { i18n as appI18n } from '@/i18n';
import type { RootStackParamList } from '@/navigation/types';
import { AppTopBar } from '@/shared/components/AppTopBar';
import { FormInput } from '@/shared/components/FormInput';
import { SelectField } from '@/shared/components/SelectField';
import { CounterField } from '@/shared/components/CounterField';
import { ToggleRow } from '@/shared/components/ToggleRow';
import { Button } from '@/shared/components/Button';
import { ListingStepper } from '@/features/listings/components/ListingStepper';
import { EquipmentMediaUploader } from '@/features/listings/components/EquipmentMediaUploader';
import { EquipmentListingReview } from '@/features/listings/components/EquipmentListingReview';
import { palette, radius, spacing } from '@/theme';
import { useListingsStore } from '@/store/listingsStore';
import type { EquipmentMediaAsset } from '@/features/listings/types/equipmentMedia.types';

type Props = NativeStackScreenProps<RootStackParamList, 'EquipmentListingForm'>;

export function EquipmentListingFormScreen({ navigation, route }: Props): React.ReactElement {
  const { mode } = route.params;
  const { t } = useTranslation(undefined, { i18n: appI18n });
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
  const [media, setMedia] = React.useState<EquipmentMediaAsset[]>([]);
  const [deliveryAvailable, setDeliveryAvailable] = React.useState(false);

  const detailsValid = Boolean(
    equipmentType &&
    title.trim() &&
    units > 0 &&
    (isRent
      ? hourlyRental.trim() || monthlyRental.trim() || weeklyRental.trim()
      : salePrice.trim()),
  );
  const mediaValid = media.length > 0;
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

  const handlePublish = () => {
    if (publishing) return;
    setPublishing(true);
    addListing({
      id: `listing_${Date.now()}_${Math.random().toString(16).slice(2, 8)}`,
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
      media,
      deliveryAvailable,
      createdAt: Date.now(),
    });
    navigation.popToTop();
  };

  const detailRows = [
    { label: t('equipmentListing.equipmentType'), value: equipmentTypeLabel ?? '' },
    { label: t('equipmentListing.title'), value: title },
    { label: t('equipmentListing.description'), value: description },
    ...(isRent
      ? [
          { label: t('equipmentListing.hourlyRental'), value: hourlyRental },
          { label: t('equipmentListing.weeklyRental'), value: weeklyRental },
          { label: t('equipmentListing.monthlyRental'), value: monthlyRental },
        ]
      : [{ label: t('equipmentListing.salePrice'), value: salePrice }]),
    { label: t('equipmentListing.units'), value: String(units) },
  ].filter((row) => row.value.trim().length > 0);

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
                  />
                </View>
                <View style={styles.priceInput}>
                  <FormInput
                    label={t('equipmentListing.weeklyRental')}
                    value={weeklyRental}
                    onChangeText={setWeeklyRental}
                    keyboardType="numeric"
                  />
                </View>
                <View style={styles.priceInput}>
                  <FormInput
                    label={t('equipmentListing.monthlyRental')}
                    value={monthlyRental}
                    onChangeText={setMonthlyRental}
                    keyboardType="numeric"
                  />
                </View>
              </View>
            ) : (
              <FormInput
                label={t('equipmentListing.salePrice')}
                value={salePrice}
                onChangeText={setSalePrice}
                keyboardType="numeric"
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
            <ToggleRow
              title={t('equipmentListing.deliveryAvailable')}
              subtitle={t('equipmentListing.deliveryAvailableSubtitle')}
              enabled={deliveryAvailable}
              onToggle={setDeliveryAvailable}
            />
          </View>
        ) : null}

        {step === 2 ? (
          <EquipmentListingReview
            detailRows={detailRows}
            media={media}
            deliveryAvailable={deliveryAvailable}
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
    backgroundColor: palette.warmWhite,
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
  unitsField: {
    width: '50%',
  },
  continueButton: {
    marginTop: spacing.sm,
  },
});
