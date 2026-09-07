import React from 'react';
import {
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { palette, radius, spacing } from '@/shared/theme/tokens';
import type { Country } from '@/shared/constants/countries';

type CountryPickerSheetProps = {
  visible: boolean;
  countries: Country[];
  selected: Country;
  onSelect: (country: Country) => void;
  onClose: () => void;
};

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
      <Text style={styles.rowFlag}>{country.flag}</Text>
      <Text style={[styles.rowName, selected && styles.rowTextSelected]}>{country.name}</Text>
      <Text style={[styles.rowDialCode, selected && styles.rowTextSelected]}>
        {country.dialCode}
      </Text>
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
          <Text style={styles.title}>Select country code</Text>
          <Pressable onPress={onClose} hitSlop={8} style={styles.headerSpacer}>
            <Text style={styles.doneLabel}>Done</Text>
          </Pressable>
        </View>

        <View style={styles.searchRow}>
          <Ionicons name="search-outline" size={16} color={palette.muted} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search country or code"
            placeholderTextColor={palette.muted}
            style={styles.searchInput}
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
    fontWeight: '700',
    color: palette.charcoal,
  },
  doneLabel: {
    color: palette.gold,
    fontSize: 15,
    fontWeight: '600',
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
