import React from 'react';
import { ActivityIndicator, Platform, Pressable, StyleSheet, TextInput, View } from 'react-native';
import MapView, { PROVIDER_GOOGLE, type Region } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { i18n as appI18n } from '@/i18n';
import { AppBottomSheet } from '@/shared/components/AppBottomSheet';
import { AppText } from '@/shared/components/AppText';
import { Button } from '@/shared/components/Button';
import { palette, radius, spacing } from '@/shared/theme/tokens';
import { hasGoogleMapsApiKey } from '@/shared/config/env';
import { resolveAddressLabel } from '@/shared/services/geocodedAddressLabel';
import { ensureLocationPermission } from '@/shared/services/locationPermission';
import { readDeviceCoordinates } from '@/shared/services/readDeviceCoordinates';
import {
  createPlacesSessionToken,
  locationsApi,
  type CallerIdentity,
  type PlacePrediction,
} from '@/shared/services/locationsApi';

export interface LocationSelection {
  label: string;
  latitude: number;
  longitude: number;
}

type LocationPickerSheetProps = {
  visible: boolean;
  initial: { latitude: number; longitude: number } | null;
  onCancel: () => void;
  onConfirm: (selection: LocationSelection) => void;
  /** Lets /locations/* authenticate an unauthenticated (pre-account) sign-up caller. */
  caller?: CallerIdentity;
};

const DEFAULT_REGION: Region = {
  latitude: 33.6844,
  longitude: 73.0479,
  latitudeDelta: 0.05,
  longitudeDelta: 0.05,
};

export function LocationPickerSheet({
  visible,
  initial,
  onCancel,
  onConfirm,
  caller,
}: LocationPickerSheetProps): React.ReactElement {
  const { t } = useTranslation(undefined, { i18n: appI18n });
  const mapRef = React.useRef<MapView>(null);
  const sessionTokenRef = React.useRef(createPlacesSessionToken());
  const skipSearchRef = React.useRef(false);

  const [pin, setPin] = React.useState<{
    latitude: number;
    longitude: number;
    label: string;
  } | null>(initial ? { ...initial, label: '' } : null);
  const [resolving, setResolving] = React.useState(false);
  const [locating, setLocating] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [searchResults, setSearchResults] = React.useState<PlacePrediction[]>([]);
  const [searchLoading, setSearchLoading] = React.useState(false);
  const [searchShowEmpty, setSearchShowEmpty] = React.useState(false);
  const [mapInstanceKey, setMapInstanceKey] = React.useState(0);

  React.useEffect(() => {
    if (!visible) return;
    // Force a fresh MapView mount each time the sheet opens — on Android, reusing a MapView
    // that first mounted while the sheet was still animating in (zero/undefined size) leaves
    // its SurfaceView stuck black even after the sheet reaches full size.
    setMapInstanceKey((key) => key + 1);
    sessionTokenRef.current = createPlacesSessionToken();
    setPin(initial ? { ...initial, label: '' } : null);
    setSearchQuery('');
    setSearchResults([]);
    setSearchLoading(false);
    setSearchShowEmpty(false);
  }, [visible, initial]);

  const resolveForRegion = React.useCallback(async (region: Region) => {
    setResolving(true);
    try {
      const label = await resolveAddressLabel(region.latitude, region.longitude);
      setPin({ latitude: region.latitude, longitude: region.longitude, label });
    } catch {
      setPin({ latitude: region.latitude, longitude: region.longitude, label: '' });
    } finally {
      setResolving(false);
    }
  }, []);

  const handleUseMyLocation = async () => {
    setLocating(true);
    try {
      const granted = await ensureLocationPermission();
      if (!granted) return;

      const coords = await readDeviceCoordinates();
      mapRef.current?.animateToRegion(
        { ...coords, latitudeDelta: 0.01, longitudeDelta: 0.01 },
        400,
      );
      await resolveForRegion({ ...coords, latitudeDelta: 0.01, longitudeDelta: 0.01 });
    } catch {
      // Silently ignore — user can still pan the map manually.
    } finally {
      setLocating(false);
    }
  };

  const handleSelectSearchResult = async (result: PlacePrediction) => {
    skipSearchRef.current = true;
    setSearchQuery(result.description);
    setSearchResults([]);

    try {
      const resolved = await locationsApi.placeDetails(
        result.placeId,
        sessionTokenRef.current,
        caller,
      );
      if (!resolved) return;
      sessionTokenRef.current = createPlacesSessionToken();
      setPin({
        latitude: resolved.latitude,
        longitude: resolved.longitude,
        label: resolved.address,
      });
      mapRef.current?.animateToRegion(
        {
          latitude: resolved.latitude,
          longitude: resolved.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        },
        400,
      );
    } catch {
      // Leave the map as-is — user can still pan manually.
    }
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

    setSearchLoading(true);
    setSearchShowEmpty(false);
    const id = setTimeout(() => {
      void locationsApi
        .autocomplete(query, sessionTokenRef.current, caller)
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
  }, [searchQuery, visible, caller]);

  const handleConfirm = () => {
    if (!pin) return;
    onConfirm({ latitude: pin.latitude, longitude: pin.longitude, label: pin.label });
  };

  const initialRegion: Region = initial
    ? { ...initial, latitudeDelta: 0.01, longitudeDelta: 0.01 }
    : DEFAULT_REGION;

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
                  key={result.placeId}
                  style={({ pressed }) => [
                    styles.searchResultRow,
                    index === searchResults.length - 1 && styles.searchResultRowLast,
                    pressed && styles.searchResultRowPressed,
                  ]}
                  onPress={() => void handleSelectSearchResult(result)}
                  accessibilityRole="button"
                >
                  <View style={styles.resultIconWrap}>
                    <Ionicons name="location" size={12} color={palette.gold} />
                  </View>
                  <AppText style={styles.searchResultText} numberOfLines={2}>
                    {result.description}
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
          <MapView
            key={mapInstanceKey}
            ref={mapRef}
            style={StyleSheet.absoluteFill}
            provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
            initialRegion={initialRegion}
            onRegionChangeComplete={(region) => void resolveForRegion(region)}
          />
          <View pointerEvents="none" style={styles.pinWrap}>
            <Ionicons name="location" size={40} color={palette.gold} />
            <View style={styles.pinShadow} />
          </View>

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
  pinWrap: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginLeft: -20,
    marginTop: -40,
    alignItems: 'center',
  },
  pinShadow: {
    width: 10,
    height: 4,
    borderRadius: 5,
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
    marginTop: -2,
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
