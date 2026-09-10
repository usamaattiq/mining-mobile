import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { WebView } from 'react-native-webview';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { i18n as appI18n } from '@/i18n';
import { AppBottomSheet } from '@/shared/components/AppBottomSheet';
import { AppText } from '@/shared/components/AppText';
import { Button } from '@/shared/components/Button';
import { palette, radius, spacing } from '@/theme';
import { googleMapsJsApiKey, hasGoogleMapsApiKey } from '@/shared/config/env';
import { resolveAddressLabel } from '@/shared/services/geocodedAddressLabel';
import { ensureLocationPermission } from '@/shared/services/locationPermission';
import { readDeviceCoordinates } from '@/shared/services/readDeviceCoordinates';
import { buildLocationMapPickerHtml } from '@/features/auth/utils/location-map-picker-html';
import {
  searchMapLocations,
  type MapSearchResult,
} from '@/features/auth/utils/location-map-geocode';
import type { LocationPickerSheetProps } from '@/features/auth/types/locationPickerSheet.types';

const DEFAULT_CENTER = {
  latitude: 33.6844,
  longitude: 73.0479,
};

export function LocationPickerSheet({
  visible,
  initial,
  onCancel,
  onConfirm,
}: LocationPickerSheetProps): React.ReactElement {
  const { t } = useTranslation(undefined, { i18n: appI18n });
  const mapWebViewRef = React.useRef<WebView>(null);
  const skipSearchRef = React.useRef(false);

  const [pin, setPin] = React.useState<{
    latitude: number;
    longitude: number;
    label: string;
  } | null>(initial ? { ...initial, label: '' } : null);
  const [resolving, setResolving] = React.useState(false);
  const [locating, setLocating] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [searchResults, setSearchResults] = React.useState<MapSearchResult[]>([]);
  const [searchLoading, setSearchLoading] = React.useState(false);
  const [searchShowEmpty, setSearchShowEmpty] = React.useState(false);
  const [mapInstanceKey, setMapInstanceKey] = React.useState(0);

  const mapCenter = initial ?? DEFAULT_CENTER;

  const mapPickerHtml = React.useMemo(() => {
    if (!hasGoogleMapsApiKey()) return '';
    return buildLocationMapPickerHtml(googleMapsJsApiKey, mapCenter);
    // HTML is rebuilt when the WebView remounts (mapInstanceKey); center is captured then.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- see above
  }, [mapInstanceKey]);

  React.useEffect(() => {
    if (!visible) return;
    // Fresh WebView each open — sizing inside the bottom sheet is unreliable if reused.
    setMapInstanceKey((key) => key + 1);
    setPin(initial ? { ...initial, label: '' } : null);
    setSearchQuery('');
    setSearchResults([]);
    setSearchLoading(false);
    setSearchShowEmpty(false);
  }, [visible, initial]);

  const panMapTo = React.useCallback((latitude: number, longitude: number) => {
    mapWebViewRef.current?.injectJavaScript(
      `window.__MINING_SET_LOCATION && window.__MINING_SET_LOCATION(${latitude}, ${longitude}); true;`,
    );
  }, []);

  const resolveForCoords = React.useCallback(async (latitude: number, longitude: number) => {
    setResolving(true);
    try {
      const label = await resolveAddressLabel(latitude, longitude);
      setPin({ latitude, longitude, label });
    } catch {
      setPin({ latitude, longitude, label: '' });
    } finally {
      setResolving(false);
    }
  }, []);

  const handleMapMessage = React.useCallback(
    (event: { nativeEvent: { data: string } }) => {
      try {
        const payload = JSON.parse(event.nativeEvent.data) as {
          latitude?: number;
          longitude?: number;
        };
        if (typeof payload.latitude !== 'number' || typeof payload.longitude !== 'number') return;
        void resolveForCoords(payload.latitude, payload.longitude);
      } catch {
        // Ignore malformed WebView messages.
      }
    },
    [resolveForCoords],
  );

  const handleUseMyLocation = async () => {
    setLocating(true);
    try {
      const granted = await ensureLocationPermission();
      if (!granted) return;

      const coords = await readDeviceCoordinates();
      panMapTo(coords.latitude, coords.longitude);
    } catch {
      // Silently ignore — user can still pan the map manually.
    } finally {
      setLocating(false);
    }
  };

  const handleSelectSearchResult = (result: MapSearchResult) => {
    skipSearchRef.current = true;
    setSearchQuery(result.label);
    setSearchResults([]);
    setPin({
      latitude: result.latitude,
      longitude: result.longitude,
      label: result.label,
    });
    panMapTo(result.latitude, result.longitude);
  };

  React.useEffect(() => {
    if (!visible) return;
    if (skipSearchRef.current) {
      skipSearchRef.current = false;
      return;
    }

    const query = searchQuery.trim();
    if (query.length < 3) {
      setSearchResults([]);
      setSearchShowEmpty(false);
      return;
    }

    if (!googleMapsJsApiKey) {
      setSearchResults([]);
      setSearchShowEmpty(true);
      return;
    }

    setSearchLoading(true);
    setSearchShowEmpty(false);
    const id = setTimeout(() => {
      void searchMapLocations(query, googleMapsJsApiKey)
        .then((results) => {
          setSearchResults(results);
          setSearchShowEmpty(results.length === 0);
        })
        .catch(() => {
          setSearchResults([]);
          setSearchShowEmpty(true);
        })
        .finally(() => setSearchLoading(false));
    }, 400);

    return () => clearTimeout(id);
  }, [searchQuery, visible]);

  const handleConfirm = () => {
    if (!pin) return;
    onConfirm({ latitude: pin.latitude, longitude: pin.longitude, label: pin.label });
  };

  return (
    <AppBottomSheet
      visible={visible}
      onClose={onCancel}
      heightRatio={0.85}
      sheetStyle={styles.sheet}
    >
      <View style={styles.grabber} />

      <View style={styles.header}>
        <View style={styles.headerIconWrap}>
          <Ionicons name="location" size={15} color={palette.gold} />
        </View>
        <AppText weight="bold" style={styles.headerTitle}>
          {t('signUpPersonalInfo.selectOnMap')}
        </AppText>
      </View>

      <View style={styles.searchCard}>
        <View style={styles.searchCardInner}>
          <View style={styles.searchInputWrap}>
            <Ionicons name="search" size={16} color={palette.muted} />
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder={t('signUpPersonalInfo.mapSearchPlaceholder')}
              placeholderTextColor={palette.muted}
              style={styles.searchInput}
              returnKeyType="search"
            />
            {searchLoading ? <ActivityIndicator size="small" color={palette.muted} /> : null}
          </View>

          {searchResults.length > 0 ? (
            <View style={styles.searchResults}>
              {searchResults.map((result, index) => (
                <Pressable
                  key={result.id}
                  style={({ pressed }) => [
                    styles.searchResultRow,
                    index === searchResults.length - 1 && styles.searchResultRowLast,
                    pressed && styles.searchResultRowPressed,
                  ]}
                  onPress={() => handleSelectSearchResult(result)}
                  accessibilityRole="button"
                >
                  <View style={styles.resultIconWrap}>
                    <Ionicons name="location" size={12} color={palette.gold} />
                  </View>
                  <AppText style={styles.searchResultText} numberOfLines={2}>
                    {result.label}
                  </AppText>
                </Pressable>
              ))}
            </View>
          ) : null}

          {!searchLoading && searchShowEmpty ? (
            <View style={styles.searchResults}>
              <AppText style={styles.searchEmptyText}>
                {t('signUpPersonalInfo.mapNoResults')}
              </AppText>
            </View>
          ) : null}
        </View>
      </View>

      {hasGoogleMapsApiKey() ? (
        <View style={styles.mapContainer}>
          <WebView
            key={mapInstanceKey}
            ref={mapWebViewRef}
            style={StyleSheet.absoluteFill}
            originWhitelist={['*']}
            source={{ html: mapPickerHtml }}
            onMessage={handleMapMessage}
            javaScriptEnabled
            domStorageEnabled
            setSupportMultipleWindows={false}
          />

          {resolving ? (
            <View style={styles.resolvingBadge}>
              <ActivityIndicator size="small" color={palette.gold} />
            </View>
          ) : null}

          <Pressable
            style={styles.locateButton}
            onPress={() => void handleUseMyLocation()}
            accessibilityRole="button"
          >
            {locating ? (
              <ActivityIndicator size="small" color={palette.charcoal} />
            ) : (
              <Ionicons name="locate" size={18} color={palette.charcoal} />
            )}
          </Pressable>
        </View>
      ) : (
        <View style={styles.unavailable}>
          <AppText style={styles.unavailableText}>{t('signUpPersonalInfo.mapUnavailable')}</AppText>
        </View>
      )}

      <View style={styles.footer}>
        <Button
          label={t('signUpPersonalInfo.confirmLocation')}
          onPress={handleConfirm}
          disabled={!pin || resolving}
        />
      </View>
    </AppBottomSheet>
  );
}

const styles = StyleSheet.create({
  sheet: {
    paddingHorizontal: 0,
    paddingTop: 0,
  },
  grabber: {
    alignSelf: 'center',
    width: 46,
    height: 5,
    borderRadius: radius.pill,
    backgroundColor: palette.softGold,
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },
  header: {
    minHeight: 40,
    paddingHorizontal: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  headerIconWrap: {
    width: 30,
    height: 30,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.softGold,
  },
  headerTitle: {
    color: palette.charcoal,
    fontSize: 17,
  },
  searchCard: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
    borderRadius: radius.lg,
    backgroundColor: palette.pureWhite,
    shadowColor: '#000000',
    shadowOpacity: 0.1,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
    zIndex: 10,
  },
  searchCardInner: {
    borderRadius: radius.lg,
    overflow: 'hidden',
  },
  searchInputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    minHeight: 48,
    paddingHorizontal: spacing.md,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: palette.charcoal,
    paddingVertical: 0,
  },
  searchResults: {
    borderTopWidth: 1,
    borderTopColor: palette.softGold,
  },
  searchResultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: palette.softGold,
  },
  searchResultRowLast: {
    borderBottomWidth: 0,
  },
  searchResultRowPressed: {
    backgroundColor: palette.softGold,
  },
  resultIconWrap: {
    width: 26,
    height: 26,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.softGold,
    flexShrink: 0,
  },
  searchResultText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
    color: palette.charcoal,
  },
  searchEmptyText: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: 13,
    color: palette.muted,
    textAlign: 'center',
  },
  mapContainer: {
    flex: 1,
    overflow: 'hidden',
  },
  resolvingBadge: {
    position: 'absolute',
    top: spacing.md,
    alignSelf: 'center',
    backgroundColor: palette.pureWhite,
    borderRadius: radius.pill,
    padding: spacing.sm,
  },
  locateButton: {
    position: 'absolute',
    right: spacing.md,
    bottom: spacing.md,
    width: 40,
    height: 40,
    borderRadius: radius.pill,
    backgroundColor: palette.pureWhite,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOpacity: 0.15,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  unavailable: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    gap: spacing.sm,
  },
  unavailableText: {
    fontSize: 14,
    color: palette.muted,
    textAlign: 'center',
  },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    backgroundColor: palette.warmWhite,
    borderTopWidth: 1,
    borderTopColor: palette.softGold,
  },
});
