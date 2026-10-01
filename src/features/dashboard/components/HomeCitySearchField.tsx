import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { i18n as appI18n } from '@/i18n';
import { useLanguage } from '@/i18n/hooks/useLanguage';
import { AppText } from '@/shared/components/AppText';
import { googleMapsJsApiKey } from '@/shared/config/env';
import { searchCities, type CitySearchResult } from '@/shared/utils/location-map-geocode';
import { getFontFamily, palette, radius, spacing } from '@/theme';

const RESULT_ROW_HEIGHT = 48;
const RESULTS_MAX_HEIGHT = RESULT_ROW_HEIGHT * 3;

type HomeCitySearchFieldProps = {
  value: string | null;
  onChange: (city: string | null) => void;
};

export function HomeCitySearchField({
  value,
  onChange,
}: HomeCitySearchFieldProps): React.ReactElement {
  const { t } = useTranslation(undefined, { i18n: appI18n });
  const { currentLanguage } = useLanguage();
  const [query, setQuery] = React.useState(value ?? '');
  const [results, setResults] = React.useState<CitySearchResult[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [showEmpty, setShowEmpty] = React.useState(false);
  const [isFocused, setIsFocused] = React.useState(false);
  const skipSearchRef = React.useRef(false);
  const inputRef = React.useRef<TextInput>(null);
  const listTouchActiveRef = React.useRef(false);

  React.useEffect(() => {
    if (isFocused) return;
    setQuery(value ?? '');
  }, [isFocused, value]);

  React.useEffect(() => {
    if (!isFocused) return;
    const id = requestAnimationFrame(() => inputRef.current?.focus());
    return () => cancelAnimationFrame(id);
  }, [isFocused]);

  React.useEffect(() => {
    if (skipSearchRef.current) {
      skipSearchRef.current = false;
      return;
    }

    if (!isFocused) {
      setResults([]);
      setShowEmpty(false);
      setLoading(false);
      return;
    }

    const trimmed = query.trim();
    if (trimmed.length < 2) {
      setResults([]);
      setShowEmpty(false);
      setLoading(false);
      return;
    }

    const timer = setTimeout(() => {
      setLoading(true);
      setShowEmpty(false);
      void searchCities(trimmed, googleMapsJsApiKey, currentLanguage)
        .then((items) => {
          setResults(items);
          setShowEmpty(items.length === 0);
        })
        .finally(() => setLoading(false));
    }, 300);

    return () => clearTimeout(timer);
  }, [currentLanguage, isFocused, query]);

  const handleSelect = (city: CitySearchResult) => {
    skipSearchRef.current = true;
    setResults([]);
    setShowEmpty(false);
    setIsFocused(false);
    setQuery(city.label);
    onChange(city.label);
  };

  const handleEdit = () => {
    skipSearchRef.current = false;
    setQuery('');
    setIsFocused(true);
  };

  const handleClear = () => {
    skipSearchRef.current = false;
    setQuery('');
    setResults([]);
    setShowEmpty(false);
    onChange(null);
  };

  return (
    <View style={styles.wrap}>
      <AppText weight="semibold" style={styles.label}>
        {t('dashboardHome.filterCity')}
      </AppText>

      {value && !isFocused ? (
        <Pressable
          onPress={handleEdit}
          style={({ pressed }) => [styles.chip, pressed && styles.chipPressed]}
          accessibilityRole="button"
        >
          <Ionicons name="location-outline" size={16} color={palette.gold} />
          <AppText style={styles.chipText} numberOfLines={1}>
            {value}
          </AppText>
          <Pressable onPress={handleClear} hitSlop={8} accessibilityRole="button">
            <Ionicons name="close-circle" size={16} color={palette.muted} />
          </Pressable>
        </Pressable>
      ) : (
        <View style={styles.inputWrap}>
          <Ionicons name="search-outline" size={16} color={palette.muted} />
          <TextInput
            ref={inputRef}
            value={query}
            onChangeText={setQuery}
            onFocus={() => setIsFocused(true)}
            onBlur={() => {
              if (listTouchActiveRef.current) return;
              setIsFocused(false);
              setResults([]);
              setShowEmpty(false);
            }}
            placeholder={t('dashboardHome.filterCityPlaceholder')}
            placeholderTextColor={palette.muted}
            autoCorrect={false}
            autoCapitalize="words"
            returnKeyType="search"
            style={[styles.input, { fontFamily: getFontFamily(currentLanguage) }]}
          />
          {loading ? <ActivityIndicator size="small" color={palette.gold} /> : null}
        </View>
      )}

      {results.length > 0 ? (
        <View style={styles.results}>
          <ScrollView
            nestedScrollEnabled
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={results.length > 3}
            style={styles.resultsScroll}
            onTouchStart={() => {
              listTouchActiveRef.current = true;
            }}
            onTouchEnd={() => {
              listTouchActiveRef.current = false;
            }}
            onTouchCancel={() => {
              listTouchActiveRef.current = false;
            }}
          >
            {results.map((item) => (
              <Pressable
                key={item.id}
                onPress={() => handleSelect(item)}
                style={({ pressed }) => [styles.resultRow, pressed && styles.pressed]}
                accessibilityRole="button"
              >
                <Ionicons name="location-outline" size={16} color={palette.gold} />
                <AppText style={styles.resultText} numberOfLines={2}>
                  {item.label}
                </AppText>
              </Pressable>
            ))}
          </ScrollView>
        </View>
      ) : null}

      {!loading && showEmpty ? (
        <AppText style={styles.hint}>{t('dashboardHome.filterCityNoResults')}</AppText>
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
    color: palette.muted,
    marginTop: spacing.md,
  },
  inputWrap: {
    minHeight: 48,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: palette.softGold,
    backgroundColor: palette.pureWhite,
    paddingHorizontal: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  chip: {
    alignSelf: 'flex-start',
    maxWidth: '100%',
    minHeight: 38,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: palette.softGold,
    backgroundColor: palette.softGold,
    paddingHorizontal: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  chipPressed: {
    opacity: 0.88,
  },
  chipText: {
    flexShrink: 1,
    fontSize: 14,
    color: palette.gold,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: palette.charcoal,
    paddingVertical: spacing.xs,
  },
  results: {
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: palette.softGold,
    backgroundColor: palette.pureWhite,
    overflow: 'hidden',
    maxHeight: RESULTS_MAX_HEIGHT,
    zIndex: 20,
    elevation: 6,
  },
  resultsScroll: {
    maxHeight: RESULTS_MAX_HEIGHT,
  },
  resultRow: {
    minHeight: RESULT_ROW_HEIGHT,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: palette.softGold,
  },
  resultText: {
    flex: 1,
    fontSize: 14,
    color: palette.charcoal,
  },
  hint: {
    fontSize: 12,
    color: palette.muted,
  },
  pressed: {
    opacity: 0.88,
  },
});
