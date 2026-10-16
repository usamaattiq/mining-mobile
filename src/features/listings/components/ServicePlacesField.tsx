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
import {
  resolveServiceAreaPlace,
  searchServiceAreas,
  townCoveredBySelectedCity,
  type ServiceAreaPlace,
} from '@/shared/utils/location-map-geocode';
import { getFontFamily, palette, radius, spacing } from '@/theme';

const RESULT_ROW_HEIGHT = 48;
const RESULTS_MAX_HEIGHT = RESULT_ROW_HEIGHT * 3;

type ServicePlacesFieldProps = {
  label: string;
  places: ServiceAreaPlace[];
  onChange: (places: ServiceAreaPlace[]) => void;
  required?: boolean;
  onFocusChange?: (focused: boolean) => void;
};

export function ServicePlacesField({
  label,
  places,
  onChange,
  required = false,
  onFocusChange,
}: ServicePlacesFieldProps): React.ReactElement {
  const { t } = useTranslation(undefined, { i18n: appI18n });
  const { currentLanguage } = useLanguage();
  const [query, setQuery] = React.useState('');
  const [results, setResults] = React.useState<ServiceAreaPlace[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [showEmpty, setShowEmpty] = React.useState(false);
  const inputRef = React.useRef<TextInput>(null);

  const visibleResults = results.filter(
    (place) =>
      !places.some((selected) => selected.id === place.id || selected.label === place.label) &&
      !townCoveredBySelectedCity(place, places),
  );
  React.useEffect(() => {
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
      void searchServiceAreas(trimmed, googleMapsJsApiKey, currentLanguage)
        .then((items) =>
          Promise.all(
            items.map((item) =>
              resolveServiceAreaPlace(item, googleMapsJsApiKey, currentLanguage),
            ),
          ),
        )
        .then((items) => {
          setResults(items);
          setShowEmpty(items.length === 0);
        })
        .catch(() => {
          setResults([]);
          setShowEmpty(true);
        })
        .finally(() => setLoading(false));
    }, 300);

    return () => clearTimeout(timer);
  }, [currentLanguage, query]);

  const addPlace = (place: ServiceAreaPlace) => {
    if (townCoveredBySelectedCity(place, places)) return;
    const next =
      place.kind === 'city'
        ? [
            ...places.filter((item) => !townCoveredBySelectedCity(item, [place])),
            place,
          ]
        : [...places, place];
    onChange(next);
    setQuery('');
    setResults([]);
    setShowEmpty(false);
  };

  return (
    <View style={styles.wrap}>
      <AppText weight="semibold" style={styles.label}>
        {label}
        {required ? <AppText style={styles.required}> *</AppText> : null}
      </AppText>
      <AppText style={styles.hint}>{t('serviceListing.placesHint')}</AppText>

      <Pressable style={styles.inputBox} onPress={() => inputRef.current?.focus()}>
        {places.map((place) => (
          <View key={place.id} style={styles.chip}>
            <AppText style={styles.chipText} numberOfLines={1}>
              {place.name || place.label.split(',')[0]}
            </AppText>
            <Pressable
              onPress={() => onChange(places.filter((item) => item.id !== place.id))}
              hitSlop={8}
              accessibilityRole="button"
            >
              <Ionicons name="close" size={14} color={palette.charcoal} />
            </Pressable>
          </View>
        ))}
        <TextInput
          ref={inputRef}
          value={query}
          onChangeText={setQuery}
          onFocus={() => onFocusChange?.(true)}
          onBlur={() => onFocusChange?.(false)}
          placeholder={places.length === 0 ? t('serviceListing.placesPlaceholder') : ''}
          placeholderTextColor={palette.muted}
          style={[styles.input, { fontFamily: getFontFamily(currentLanguage) }]}
        />
        {loading ? <ActivityIndicator size="small" color={palette.gold} /> : null}
      </Pressable>

      {visibleResults.length > 0 ? (
        <ScrollView style={styles.results} keyboardShouldPersistTaps="handled" nestedScrollEnabled>
          {visibleResults.map((place) => (
            <Pressable key={place.id} style={styles.resultRow} onPress={() => addPlace(place)}>
              <Ionicons name="location-outline" size={16} color={palette.gold} />
              <AppText style={styles.resultText} numberOfLines={1}>
                {place.label}
              </AppText>
            </Pressable>
          ))}
        </ScrollView>
      ) : showEmpty && query.trim().length >= 2 && !loading ? (
        <AppText style={styles.empty}>{t('serviceListing.placesEmpty')}</AppText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.xs },
  label: { fontSize: 13, color: palette.charcoal },
  required: { fontSize: 13, color: palette.danger },
  hint: { fontSize: 12, color: palette.muted, lineHeight: 18 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    maxWidth: '100%',
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: palette.softGold,
    backgroundColor: palette.pureWhite,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  chipText: { fontSize: 13, color: palette.charcoal, flexShrink: 1 },
  inputBox: {
    minHeight: 50,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: palette.softGold,
    backgroundColor: palette.pureWhite,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: spacing.xs,
  },
  input: {
    flexGrow: 1,
    flexBasis: 120,
    minWidth: 80,
    fontSize: 15,
    color: palette.charcoal,
    paddingVertical: spacing.sm,
  },
  results: {
    maxHeight: RESULTS_MAX_HEIGHT,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: palette.softGold,
    backgroundColor: palette.pureWhite,
  },
  resultRow: {
    minHeight: RESULT_ROW_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  resultText: { flex: 1, fontSize: 14, color: palette.charcoal },
  empty: { fontSize: 13, color: palette.muted },
});
