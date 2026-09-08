import React from 'react';
import {
  ActivityIndicator,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';
import MapView, { PROVIDER_GOOGLE, type Region } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { i18n as appI18n } from '@/i18n';
import { AppText } from '@/shared/components/AppText';
import { Button } from '@/shared/components/Button';
import { palette, radius, spacing } from '@/shared/theme/tokens';
import { hasGoogleMapsApiKey } from '@/shared/config/env';
import { resolveAddressLabel } from '@/shared/services/geocodedAddressLabel';
import { ensureLocationPermission } from '@/shared/services/locationPermission';
import { readDeviceCoordinates } from '@/shared/services/readDeviceCoordinates';

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
}: LocationPickerSheetProps): React.ReactElement {
  const { t } = useTranslation(undefined, { i18n: appI18n });
  const { height } = useWindowDimensions();
  const sheetHeight = Math.round(height * 0.85);
  const mapRef = React.useRef<MapView>(null);

  const [pin, setPin] = React.useState<{
    latitude: number;
    longitude: number;
    label: string;
  } | null>(initial ? { ...initial, label: '' } : null);
  const [resolving, setResolving] = React.useState(false);
  const [locating, setLocating] = React.useState(false);

  React.useEffect(() => {
    if (!visible) return;
    setPin(initial ? { ...initial, label: '' } : null);
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

  const handleConfirm = () => {
    if (!pin) return;
    onConfirm({ latitude: pin.latitude, longitude: pin.longitude, label: pin.label });
  };

  const initialRegion: Region = initial
    ? { ...initial, latitudeDelta: 0.01, longitudeDelta: 0.01 }
    : DEFAULT_REGION;

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onCancel}>
      <Pressable style={styles.backdrop} onPress={onCancel} />
      <View style={[styles.sheet, { height: sheetHeight }]}>
        <View style={styles.handle} />

        <View style={styles.header}>
          <View style={styles.headerSpacer} />
          <AppText weight="bold" style={styles.title}>
            {t('signUpPersonalInfo.selectOnMap')}
          </AppText>
          <Pressable
            onPress={onCancel}
            hitSlop={8}
            style={styles.closeButton}
            accessibilityRole="button"
            accessibilityLabel={t('common.close')}
          >
            <Ionicons name="close" size={22} color={palette.muted} />
          </Pressable>
        </View>

        {hasGoogleMapsApiKey() ? (
          <View style={styles.mapContainer}>
            <MapView
              ref={mapRef}
              style={StyleSheet.absoluteFill}
              provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
              initialRegion={initialRegion}
              onRegionChangeComplete={(region) => void resolveForRegion(region)}
            />
            <View pointerEvents="none" style={styles.pinWrap}>
              <Ionicons name="location" size={40} color={palette.gold} />
            </View>

            <Pressable
              style={styles.locateButton}
              onPress={() => void handleUseMyLocation()}
              accessibilityRole="button"
            >
              {locating ? (
                <ActivityIndicator size="small" color={palette.charcoal} />
              ) : (
                <Ionicons name="locate" size={20} color={palette.charcoal} />
              )}
            </Pressable>

            <View style={styles.addressBar}>
              {resolving ? (
                <ActivityIndicator size="small" color={palette.muted} />
              ) : (
                <AppText numberOfLines={2} style={styles.addressText}>
                  {pin?.label || t('signUpPersonalInfo.panToSelect')}
                </AppText>
              )}
            </View>
          </View>
        ) : (
          <View style={styles.unavailable}>
            <AppText style={styles.unavailableText}>
              {t('signUpPersonalInfo.mapUnavailable')}
            </AppText>
          </View>
        )}

        <Button
          label={t('signUpPersonalInfo.confirmLocation')}
          onPress={handleConfirm}
          disabled={!pin || resolving}
          style={styles.confirmButton}
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
    paddingBottom: spacing.lg,
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: radius.sm,
    backgroundColor: palette.softGold,
    marginBottom: spacing.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: spacing.sm,
  },
  headerSpacer: {
    width: 36,
  },
  closeButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    flex: 1,
    fontSize: 17,
    color: palette.charcoal,
    textAlign: 'center',
  },
  mapContainer: {
    flex: 1,
    borderRadius: radius.lg,
    overflow: 'hidden',
    marginBottom: spacing.md,
  },
  pinWrap: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginLeft: -20,
    marginTop: -40,
  },
  locateButton: {
    position: 'absolute',
    right: spacing.md,
    top: spacing.md,
    width: 40,
    height: 40,
    borderRadius: radius.pill,
    backgroundColor: palette.pureWhite,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  addressBar: {
    position: 'absolute',
    bottom: spacing.md,
    left: spacing.md,
    right: spacing.md,
    backgroundColor: palette.pureWhite,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    minHeight: 44,
    justifyContent: 'center',
  },
  addressText: {
    fontSize: 13,
    color: palette.charcoal,
  },
  unavailable: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  unavailableText: {
    fontSize: 14,
    color: palette.muted,
    textAlign: 'center',
  },
  confirmButton: {
    marginTop: spacing.xs,
  },
});
