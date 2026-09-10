import React from 'react';
import { Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { i18n as appI18n } from '@/i18n';
import { AppText } from '@/shared/components/AppText';
import { AppBottomSheet } from '@/shared/components/AppBottomSheet';
import { palette, radius, spacing } from '@/theme';
import type { SelectFieldProps } from '@/shared/types/selectField.types';

/** Dropdown-style field: a FormInput-shaped trigger that opens a bottom sheet list of options. */
export function SelectField({
  label,
  placeholder,
  sheetTitle,
  options,
  value,
  onChange,
  required,
  error,
  searchable,
  searchPlaceholder,
}: SelectFieldProps): React.ReactElement {
  const { t } = useTranslation(undefined, { i18n: appI18n });
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState('');
  const selectedOption = options.find((option) => option.value === value);

  const filteredOptions = searchable
    ? options.filter((option) => option.label.toLowerCase().includes(query.trim().toLowerCase()))
    : options;

  const handleSelect = (next: string) => {
    onChange(next);
    setOpen(false);
    setQuery('');
  };

  return (
    <View style={styles.container}>
      {label ? (
        <AppText weight="semibold" style={styles.label}>
          {label}
          {required ? <AppText style={styles.required}> *</AppText> : null}
        </AppText>
      ) : null}
      <Pressable
        onPress={() => setOpen(true)}
        style={[styles.trigger, error ? styles.triggerError : null]}
        accessibilityRole="button"
        accessibilityLabel={label ?? placeholder}
      >
        {selectedOption?.icon ? (
          <View style={styles.triggerIconWrap}>
            <Ionicons name={selectedOption.icon} size={16} color={palette.gold} />
          </View>
        ) : null}
        <AppText
          style={[styles.triggerText, !selectedOption && styles.triggerPlaceholder]}
          numberOfLines={1}
        >
          {selectedOption?.label ?? placeholder}
        </AppText>
        <Ionicons name="chevron-down" size={18} color={palette.muted} />
      </Pressable>
      {error ? <AppText style={styles.error}>{error}</AppText> : null}

      <AppBottomSheet visible={open} onClose={() => setOpen(false)} heightRatio={0.5}>
        <AppText weight="bold" style={styles.sheetTitle}>
          {sheetTitle}
        </AppText>

        {searchable ? (
          <View style={styles.searchRow}>
            <Ionicons name="search-outline" size={18} color={palette.muted} />
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder={searchPlaceholder ?? t('common.search')}
              placeholderTextColor={palette.muted}
              style={styles.searchInput}
            />
            {query ? (
              <Pressable onPress={() => setQuery('')} hitSlop={8}>
                <Ionicons name="close-circle" size={18} color={palette.muted} />
              </Pressable>
            ) : null}
          </View>
        ) : null}

        <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          {filteredOptions.map((option) => {
            const selected = option.value === value;
            return (
              <Pressable
                key={option.value}
                onPress={() => handleSelect(option.value)}
                style={({ pressed }) => [
                  styles.option,
                  selected && styles.optionSelected,
                  pressed && styles.pressed,
                ]}
              >
                {option.icon ? (
                  <View style={styles.optionIconWrap}>
                    <Ionicons name={option.icon} size={18} color={palette.gold} />
                  </View>
                ) : null}
                <AppText weight="medium" style={styles.optionLabel}>
                  {option.label}
                </AppText>
                {selected ? <Ionicons name="checkmark" size={18} color={palette.gold} /> : null}
              </Pressable>
            );
          })}
        </ScrollView>
      </AppBottomSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
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
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: palette.softGold,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 4,
  },
  triggerError: {
    borderColor: palette.danger,
  },
  triggerIconWrap: {
    width: 28,
    height: 28,
    borderRadius: radius.sm,
    backgroundColor: palette.softGold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  triggerText: {
    flex: 1,
    fontSize: 15,
    color: palette.charcoal,
  },
  triggerPlaceholder: {
    color: palette.muted,
  },
  error: {
    fontSize: 12,
    color: palette.danger,
  },
  sheetTitle: {
    fontSize: 16,
    color: palette.charcoal,
    textAlign: 'center',
    marginBottom: spacing.sm,
    paddingVertical: spacing.sm,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: palette.softGold,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
  },
  searchInput: {
    flex: 1,
    paddingVertical: spacing.sm + 4,
    fontSize: 15,
    color: palette.charcoal,
  },
  option: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.md,
  },
  optionSelected: {
    backgroundColor: palette.softGold,
  },
  optionIconWrap: {
    width: 32,
    height: 32,
    borderRadius: radius.sm,
    backgroundColor: palette.softGold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionLabel: {
    flex: 1,
    fontSize: 15,
    color: palette.charcoal,
  },
  pressed: {
    opacity: 0.88,
  },
});
