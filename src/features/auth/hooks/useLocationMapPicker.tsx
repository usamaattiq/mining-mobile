import React from 'react';
import {
  LocationPickerSheet,
  type LocationSelection,
} from '@/features/auth/components/location/LocationPickerSheet';
import { resolveAddressLabel } from '@/shared/services/geocodedAddressLabel';
import { ensureLocationPermission } from '@/shared/services/locationPermission';
import { readDeviceCoordinates } from '@/shared/services/readDeviceCoordinates';

export type { LocationSelection };

export function useLocationMapPicker(): {
  locationLoading: boolean;
  getCurrentLocation: () => Promise<LocationSelection | null>;
  openMapPickerForSelection: (
    onConfirm: (selection: LocationSelection) => void,
    initial?: { latitude: number; longitude: number } | null,
  ) => void;
  mapPickerSheet: React.ReactElement;
} {
  const [locationLoading, setLocationLoading] = React.useState(false);
  const [sheetVisible, setSheetVisible] = React.useState(false);
  const [sheetInitial, setSheetInitial] = React.useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const confirmSelectionRef = React.useRef<((selection: LocationSelection) => void) | null>(null);

  const getCurrentLocation = React.useCallback(async (): Promise<LocationSelection | null> => {
    setLocationLoading(true);
    try {
      const granted = await ensureLocationPermission();
      if (!granted) return null;

      const coords = await readDeviceCoordinates();
      const label = await resolveAddressLabel(coords.latitude, coords.longitude);
      return { label, latitude: coords.latitude, longitude: coords.longitude };
    } catch {
      return null;
    } finally {
      setLocationLoading(false);
    }
  }, []);

  const openMapPickerForSelection = React.useCallback(
    (
      onConfirm: (selection: LocationSelection) => void,
      initial?: { latitude: number; longitude: number } | null,
    ) => {
      confirmSelectionRef.current = onConfirm;
      setSheetInitial(initial ?? null);
      setSheetVisible(true);
    },
    [],
  );

  const handleCancel = React.useCallback(() => {
    setSheetVisible(false);
    confirmSelectionRef.current = null;
  }, []);

  const handleConfirm = React.useCallback((selection: LocationSelection) => {
    setSheetVisible(false);
    confirmSelectionRef.current?.(selection);
    confirmSelectionRef.current = null;
  }, []);

  const mapPickerSheet = (
    <LocationPickerSheet
      visible={sheetVisible}
      initial={sheetInitial}
      onCancel={handleCancel}
      onConfirm={handleConfirm}
    />
  );

  return { locationLoading, getCurrentLocation, openMapPickerForSelection, mapPickerSheet };
}
