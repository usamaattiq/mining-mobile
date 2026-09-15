import React from 'react';
import { Platform, Pressable, StyleSheet, View } from 'react-native';
import DateTimePicker, { type DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { i18n as appI18n } from '@/i18n';
import { AppBottomSheet } from '@/shared/components/AppBottomSheet';
import { AppText } from '@/shared/components/AppText';
import { Button } from '@/shared/components/Button';
import { HomeCitySearchField } from '@/features/dashboard/components/HomeCitySearchField';
import { palette, radius, spacing } from '@/theme';

export type HomeTypeFilter = 'all' | 'rent' | 'sell' | 'onsite' | 'online';

export type HomeFilterSheetOption = {
  key: HomeTypeFilter;
  label: string;
};

type HomeFilterSheetProps = {
  visible: boolean;
  onClose: () => void;
  typeOptions: HomeFilterSheetOption[];
  locale: string;
  draftType: HomeTypeFilter;
  draftCity: string | null;
  draftDateKey: string | null;
  onChangeType: (value: HomeTypeFilter) => void;
  onChangeCity: (value: string | null) => void;
  onChangeDateKey: (value: string | null) => void;
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
  locale,
  draftType,
  draftCity,
  draftDateKey,
  onChangeType,
  onChangeCity,
  onChangeDateKey,
  onApply,
}: HomeFilterSheetProps): React.ReactElement {
  const { t } = useTranslation(undefined, { i18n: appI18n });
  const [pickingDate, setPickingDate] = React.useState(false);

  React.useEffect(() => {
    if (!visible) setPickingDate(false);
  }, [visible]);

  const showType = typeOptions.length > 1;

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
    <AppBottomSheet visible={visible} onClose={onClose} heightRatio={0.62}>
      <AppText weight="bold" style={styles.sheetTitle}>
        {t('dashboardHome.filterTitle')}
      </AppText>

      {showType ? (
        <View style={styles.badgeRow}>
          {typeOptions.map((option) => {
            const selected = draftType === option.key;
            return (
              <Pressable
                key={option.key}
                onPress={() => onChangeType(option.key)}
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
      ) : null}

      <HomeCitySearchField value={draftCity} onChange={onChangeCity} />

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
        <DateTimePicker
          value={draftDateKey ? dateFromDayKey(draftDateKey) : new Date()}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleDateChange}
        />
      ) : null}
      {Platform.OS === 'ios' && pickingDate ? (
        <Button
          label={t('common.done')}
          onPress={() => setPickingDate(false)}
          style={styles.doneButton}
        />
      ) : null}

      <Button label={t('dashboardHome.apply')} onPress={onApply} style={styles.applyButton} />
    </AppBottomSheet>
  );
}

const styles = StyleSheet.create({
  sheetTitle: {
    fontSize: 16,
    color: palette.charcoal,
    textAlign: 'center',
    marginBottom: spacing.sm,
    paddingVertical: spacing.sm,
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
