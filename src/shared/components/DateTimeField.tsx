import React from 'react';
import { Platform, Pressable, StyleSheet, View } from 'react-native';
import DateTimePicker, { type DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { i18n as appI18n } from '@/i18n';
import { useLanguage } from '@/i18n/hooks/useLanguage';
import { AppBottomSheet } from '@/shared/components/AppBottomSheet';
import { AppText } from '@/shared/components/AppText';
import { Button } from '@/shared/components/Button';
import { palette, radius, spacing } from '@/theme';
import type { DateTimeFieldProps } from '@/shared/types/dateTimeField.types';

type AndroidStage = 'date' | 'time' | null;

function formatValue(value: Date, locale: string): string {
  return new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeStyle: 'short' }).format(value);
}

/** Date + time field — a bottom-sheet spinner on iOS, sequential native dialogs on Android. */
export function DateTimeField({
  label,
  value,
  required = false,
  placeholder = 'Select date & time',
  onChange,
}: DateTimeFieldProps): React.ReactElement {
  const { t } = useTranslation(undefined, { i18n: appI18n });
  const { currentLanguage } = useLanguage();
  const [sheetOpen, setSheetOpen] = React.useState(false);
  const [draft, setDraft] = React.useState(value ?? new Date());
  const [androidStage, setAndroidStage] = React.useState<AndroidStage>(null);
  const [androidDraftDate, setAndroidDraftDate] = React.useState<Date | null>(null);

  const openPicker = () => {
    if (Platform.OS === 'android') {
      setAndroidDraftDate(null);
      setAndroidStage('date');
      return;
    }
    setDraft(value ?? new Date());
    setSheetOpen(true);
  };

  const handleAndroidChange = (event: DateTimePickerEvent, selected?: Date) => {
    if (event.type !== 'set' || !selected) {
      setAndroidStage(null);
      return;
    }
    if (androidStage === 'date') {
      setAndroidDraftDate(selected);
      setAndroidStage('time');
      return;
    }
    const base = androidDraftDate ?? new Date();
    const combined = new Date(base);
    combined.setHours(selected.getHours(), selected.getMinutes(), 0, 0);
    onChange(combined);
    setAndroidStage(null);
    setAndroidDraftDate(null);
  };

  const handleConfirm = () => {
    onChange(draft);
    setSheetOpen(false);
  };

  return (
    <View style={styles.wrap}>
      <AppText weight="semibold" style={styles.label}>
        {label}
        {required ? <AppText style={styles.required}> *</AppText> : null}
      </AppText>

      <Pressable
        onPress={openPicker}
        style={({ pressed }) => [styles.box, pressed && styles.boxPressed]}
        accessibilityRole="button"
        accessibilityLabel={label}
      >
        <Ionicons name="calendar-outline" size={18} color={palette.gold} />
        <AppText style={[styles.value, !value && styles.placeholder]} numberOfLines={1}>
          {value ? formatValue(value, currentLanguage) : placeholder}
        </AppText>
      </Pressable>

      {Platform.OS === 'android' && androidStage ? (
        <DateTimePicker
          value={androidStage === 'date' ? (value ?? new Date()) : (androidDraftDate ?? new Date())}
          mode={androidStage}
          onChange={handleAndroidChange}
        />
      ) : null}

      {Platform.OS === 'ios' ? (
        <AppBottomSheet visible={sheetOpen} onClose={() => setSheetOpen(false)} heightRatio={0.4}>
          <AppText weight="bold" style={styles.sheetTitle}>
            {label}
          </AppText>
          <DateTimePicker
            value={draft}
            mode="datetime"
            display="spinner"
            onChange={(_event, selected) => selected && setDraft(selected)}
          />
          <Button label={t('common.done')} onPress={handleConfirm} style={styles.confirmButton} />
        </AppBottomSheet>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: spacing.xs,
  },
  label: {
    fontSize: 13,
    color: palette.charcoal,
  },
  required: {
    fontSize: 13,
    color: palette.danger,
  },
  box: {
    minHeight: 50,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: palette.softGold,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    backgroundColor: palette.pureWhite,
  },
  boxPressed: {
    backgroundColor: palette.warmWhite,
  },
  value: {
    fontSize: 14,
    color: palette.charcoal,
  },
  placeholder: {
    color: palette.muted,
  },
  sheetTitle: {
    fontSize: 16,
    color: palette.charcoal,
    textAlign: 'center',
    paddingVertical: spacing.sm,
  },
  confirmButton: {
    marginTop: spacing.sm,
  },
});
