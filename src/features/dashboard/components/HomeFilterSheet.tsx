import React from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import DateTimePicker, { type DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { i18n as appI18n } from '@/i18n';
import { AppBottomSheet } from '@/shared/components/AppBottomSheet';
import { AppText } from '@/shared/components/AppText';
import { Button } from '@/shared/components/Button';
import { FormInput } from '@/shared/components/FormInput';
import { HomeCitySearchField } from '@/features/dashboard/components/HomeCitySearchField';
import { MultiSelectDropdown } from '@/features/dashboard/components/MultiSelectDropdown';
import { palette, radius, spacing } from '@/theme';

export type HomeTypeFilter = 'all' | 'rent' | 'sell' | 'onsite' | 'online' | '18k' | '21k' | '22k' | '24k';

export type HomeFilterSheetOption = {
  key: string;
  label: string;
};

type HomeFilterSheetProps = {
  visible: boolean;
  onClose: () => void;
  typeOptions: HomeFilterSheetOption[];
  typeTitle: string;
  kindTitle?: string;
  kindPlaceholder?: string;
  kindOptions?: HomeFilterSheetOption[];
  showWeight: boolean;
  currencyCode: string;
  locale: string;
  draftType: HomeTypeFilter;
  draftKind: string[];
  draftCity: string | null;
  draftDateKey: string | null;
  draftPriceMin: string;
  draftPriceMax: string;
  draftWeightMin: string;
  draftWeightMax: string;
  onChangeType: (value: HomeTypeFilter) => void;
  onChangeKind: (value: string[]) => void;
  onChangeCity: (value: string | null) => void;
  onChangeDateKey: (value: string | null) => void;
  onChangePriceMin: (value: string) => void;
  onChangePriceMax: (value: string) => void;
  onChangeWeightMin: (value: string) => void;
  onChangeWeightMax: (value: string) => void;
  onReset: () => void;
  onApply: () => void;
};

export function toDayKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function dayKeyFromEpoch(epoch: number): string {
  return toDayKey(new Date(epoch));
}

function formatDayKey(dayKey: string, locale: string): string {
  const [year, month, day] = dayKey.split('-').map(Number);
  if (!year || !month || !day) return dayKey;
  return new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }).format(
    new Date(year, month - 1, day),
  );
}

function dateFromDayKey(dayKey: string): Date {
  const [year, month, day] = dayKey.split('-').map(Number);
  if (!year || !month || !day) return new Date();
  return new Date(year, month - 1, day);
}

export function HomeFilterSheet({
  visible,
  onClose,
  typeOptions,
  typeTitle,
  kindTitle,
  kindPlaceholder,
  kindOptions,
  showWeight,
  currencyCode,
  locale,
  draftType,
  draftKind,
  draftCity,
  draftDateKey,
  draftPriceMin,
  draftPriceMax,
  draftWeightMin,
  draftWeightMax,
  onChangeType,
  onChangeKind,
  onChangeCity,
  onChangeDateKey,
  onChangePriceMin,
  onChangePriceMax,
  onChangeWeightMin,
  onChangeWeightMax,
  onReset,
  onApply,
}: HomeFilterSheetProps): React.ReactElement {
  const { t } = useTranslation(undefined, { i18n: appI18n });
  const [pickingDate, setPickingDate] = React.useState(false);

  React.useEffect(() => {
    if (!visible) setPickingDate(false);
  }, [visible]);

  const handleDateChange = (event: DateTimePickerEvent, selected?: Date) => {
    if (Platform.OS === 'android') {
      setPickingDate(false);
      if (event.type !== 'set' || !selected) return;
      onChangeDateKey(toDayKey(selected));
      return;
    }
    if (selected) {
      onChangeDateKey(toDayKey(selected));
    }
  };

  return (
    <AppBottomSheet visible={visible} onClose={onClose} heightRatio={0.78}>
      <ScrollView
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.titleRow}>
          <AppText weight="bold" style={styles.sheetTitle}>
            {t('dashboardHome.filterTitle')}
          </AppText>
          <Pressable
            onPress={onReset}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel={t('common.reset')}
          >
            <AppText weight="semibold" style={styles.reset}>
              {t('common.reset')}
            </AppText>
          </Pressable>
        </View>

        <AppText weight="semibold" style={styles.sectionTitleFirst}>
          {typeTitle}
        </AppText>
        <View style={styles.badgeRow}>
          {typeOptions.map((option) => {
            const selected = draftType === option.key;
            return (
              <Pressable
                key={option.key}
                onPress={() => onChangeType(option.key as HomeTypeFilter)}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                style={({ pressed }) => [
                  styles.typeBadge,
                  selected && styles.typeBadgeSelected,
                  pressed && styles.pressed,
                ]}
              >
                <AppText
                  weight="semibold"
                  style={[styles.typeBadgeLabel, selected && styles.typeBadgeLabelSelected]}
                >
                  {option.label}
                </AppText>
              </Pressable>
            );
          })}
        </View>

        <HomeCitySearchField value={draftCity} onChange={onChangeCity} />

        {kindOptions && kindOptions.length > 0 && kindTitle ? (
          <MultiSelectDropdown
            label={kindTitle}
            placeholder={kindPlaceholder ?? kindTitle}
            options={kindOptions}
            values={draftKind}
            onChange={onChangeKind}
          />
        ) : null}

        {showWeight ? (
          <>
            <AppText weight="semibold" style={styles.sectionTitle}>
              {t('dashboardHome.filterWeight')}
            </AppText>
            <View style={styles.rangeRow}>
              <View style={styles.rangeField}>
                <FormInput
                  label={t('dashboardHome.filterMin')}
                  value={draftWeightMin}
                  onChangeText={onChangeWeightMin}
                  keyboardType="numeric"
                  placeholder={t('goldListing.weightUnit')}
                />
              </View>
              <View style={styles.rangeField}>
                <FormInput
                  label={t('dashboardHome.filterMax')}
                  value={draftWeightMax}
                  onChangeText={onChangeWeightMax}
                  keyboardType="numeric"
                  placeholder={t('goldListing.weightUnit')}
                />
              </View>
            </View>
          </>
        ) : null}

        <AppText weight="semibold" style={styles.sectionTitle}>
          {t('dashboardHome.filterPriceRange')}
        </AppText>
        <View style={styles.rangeRow}>
          <View style={styles.rangeField}>
            <FormInput
              label={t('dashboardHome.filterMin')}
              value={draftPriceMin}
              onChangeText={onChangePriceMin}
              keyboardType="numeric"
              placeholder={currencyCode}
            />
          </View>
          <View style={styles.rangeField}>
            <FormInput
              label={t('dashboardHome.filterMax')}
              value={draftPriceMax}
              onChangeText={onChangePriceMax}
              keyboardType="numeric"
              placeholder={currencyCode}
            />
          </View>
        </View>

        <AppText weight="semibold" style={styles.sectionTitle}>
          {t('dashboardHome.filterDate')}
        </AppText>
        <Pressable
          onPress={() => setPickingDate(true)}
          style={({ pressed }) => [styles.dateRow, pressed && styles.pressed]}
        >
          <Ionicons name="calendar-outline" size={18} color={palette.gold} />
          <AppText style={[styles.dateValue, !draftDateKey && styles.placeholder]}>
            {draftDateKey ? formatDayKey(draftDateKey, locale) : t('dashboardHome.filterAnyDate')}
          </AppText>
        </Pressable>
        {pickingDate ? (
          <View style={Platform.OS === 'ios' ? styles.iosPickerWrap : undefined}>
            <DateTimePicker
              value={draftDateKey ? dateFromDayKey(draftDateKey) : new Date()}
              mode="date"
              onChange={handleDateChange}
              {...(Platform.OS === 'ios'
                ? {
                    display: 'spinner' as const,
                    themeVariant: 'light' as const,
                    textColor: palette.charcoal,
                    style: styles.iosPicker,
                  }
                : { display: 'default' as const })}
            />
          </View>
        ) : null}
        {Platform.OS === 'ios' && pickingDate ? (
          <Button
            label={t('common.done')}
            onPress={() => setPickingDate(false)}
            style={styles.doneButton}
          />
        ) : null}

        <Button label={t('dashboardHome.apply')} onPress={onApply} style={styles.applyButton} />
      </ScrollView>
    </AppBottomSheet>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: spacing.lg,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
    paddingVertical: spacing.sm,
  },
  sheetTitle: {
    fontSize: 16,
    color: palette.charcoal,
  },
  reset: {
    fontSize: 13,
    color: palette.gold,
  },
  sectionTitleFirst: {
    fontSize: 13,
    color: palette.muted,
    marginBottom: spacing.xs,
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    paddingBottom: spacing.sm,
  },
  typeBadge: {
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: palette.softGold,
    backgroundColor: palette.pureWhite,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
  },
  typeBadgeSelected: {
    backgroundColor: palette.gold,
    borderColor: palette.gold,
  },
  typeBadgeLabel: {
    fontSize: 13,
    color: palette.charcoal,
  },
  typeBadgeLabelSelected: {
    color: palette.pureWhite,
  },
  rangeRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  rangeField: {
    flex: 1,
    minWidth: 0,
  },
  sectionTitle: {
    fontSize: 13,
    color: palette.muted,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  dateRow: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: palette.softGold,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    backgroundColor: palette.pureWhite,
  },
  dateValue: {
    flex: 1,
    fontSize: 15,
    color: palette.charcoal,
  },
  iosPickerWrap: {
    height: 216,
    justifyContent: 'center',
  },
  iosPicker: {
    height: 216,
    width: '100%',
  },
  placeholder: {
    color: palette.muted,
  },
  pressed: {
    opacity: 0.88,
  },
  doneButton: {
    marginTop: spacing.xs,
  },
  applyButton: {
    marginTop: spacing.lg,
  },
});
