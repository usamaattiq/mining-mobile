import React from 'react';
import {
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { i18n as appI18n } from '@/i18n';
import { useLanguage } from '@/i18n/hooks/useLanguage';
import { AppText } from '@/shared/components/AppText';
import { palette, radius, spacing, getFontFamily } from '@/theme';
import type { Country } from '@/shared/constants/countries';
import type { CountryPickerSheetProps } from '@/shared/types/countryPicker.types';

function CountryRow({
  country,
  selected,
  onPress,
}: {
  country: Country;
  selected: boolean;
  onPress: () => void;
}): React.ReactElement {
  return (
    <Pressable onPress={onPress} style={[styles.row, selected && styles.rowSelected]}>
      <AppText style={styles.rowFlag}>{country.flag}</AppText>
      <AppText
        weight={selected ? 'semibold' : 'regular'}
        style={[styles.rowName, selected && styles.rowTextSelected]}
      >
        {country.name}
      </AppText>
      <AppText
        weight={selected ? 'semibold' : 'regular'}
        style={[styles.rowDialCode, selected && styles.rowTextSelected]}
      >
        {country.dialCode}
      </AppText>
    </Pressable>
  );
}

export function CountryPickerSheet({
  visible,
  countries,
  selected,
  onSelect,
  onClose,
}: CountryPickerSheetProps): React.ReactElement {
  const { t } = useTranslation(undefined, { i18n: appI18n });
  const { currentLanguage } = useLanguage();
  const { height } = useWindowDimensions();
  const [query, setQuery] = React.useState('');
  const sheetHeight = Math.round(height * 0.75);

  React.useEffect(() => {
    if (visible) setQuery('');
  }, [visible]);

  const filteredCountries = React.useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return countries;
    return countries.filter(
      (country) =>
        country.name.toLowerCase().includes(normalized) ||
        country.dialCode.includes(normalized) ||
        country.iso2.toLowerCase().includes(normalized),
    );
  }, [countries, query]);

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <View style={[styles.sheet, { height: sheetHeight }]}>
        <View style={styles.header}>
          <View style={styles.headerSpacer} />
          <AppText weight="bold" style={styles.title}>
            {t('signUpPhone.selectCountryCode')}
          </AppText>
          <Pressable onPress={onClose} hitSlop={8} style={styles.headerSpacer}>
            <AppText weight="semibold" style={styles.doneLabel}>
              {t('common.done')}
            </AppText>
          </Pressable>
        </View>

        <View style={styles.searchRow}>
          <Ionicons name="search-outline" size={16} color={palette.muted} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder={t('signUpPhone.searchCountry')}
            placeholderTextColor={palette.muted}
            style={[styles.searchInput, { fontFamily: getFontFamily(currentLanguage) }]}
          />
        </View>

        <FlatList
          data={filteredCountries}
          keyExtractor={(country) => country.iso2}
          style={styles.list}
          renderItem={({ item }) => (
            <CountryRow
              country={item}
              selected={item.iso2 === selected.iso2}
              onPress={() => onSelect(item)}
            />
          )}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(34, 34, 34, 0.4)',
  },
  sheet: {
    backgroundColor: palette.pureWhite,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
  },
  headerSpacer: {
    minWidth: 44,
  },
  title: {
    fontSize: 16,
    color: palette.charcoal,
  },
  doneLabel: {
    color: palette.gold,
    fontSize: 15,
    textAlign: 'right',
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: palette.softGold,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    height: 44,
    marginBottom: spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: palette.charcoal,
  },
  list: {
    flex: 1,
    marginBottom: spacing.sm,
  },
  row: {
    minHeight: 52,
    borderRadius: radius.md,
    paddingHorizontal: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  rowSelected: {
    backgroundColor: palette.softGold,
  },
  rowTextSelected: {
    color: palette.gold,
  },
  rowFlag: {
    fontSize: 20,
  },
  rowName: {
    flex: 1,
    fontSize: 15,
    color: palette.charcoal,
  },
  rowDialCode: {
    fontSize: 15,
    color: palette.muted,
  },
});
