import * as Location from 'expo-location';

export interface DeviceCoordinates {
  latitude: number;
  longitude: number;
}

const ATTEMPT_ACCURACIES = [
  Location.Accuracy.Low,
  Location.Accuracy.Balanced,
  Location.Accuracy.Low,
];

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Cold GPS reads often fail the first try on Android — retry with a short delay. */
export async function readDeviceCoordinates(): Promise<DeviceCoordinates> {
  const cached = await Location.getLastKnownPositionAsync({ maxAge: 600_000 });
  if (cached) {
    return { latitude: cached.coords.latitude, longitude: cached.coords.longitude };
  }

  for (const accuracy of ATTEMPT_ACCURACIES) {
    try {
      const position = await Location.getCurrentPositionAsync({
        accuracy,
        mayShowUserSettingsDialog: true,
      });
      return { latitude: position.coords.latitude, longitude: position.coords.longitude };
    } catch {
      await delay(400);
    }
  }

  const fallback = await Location.getLastKnownPositionAsync();
  if (fallback) {
    return { latitude: fallback.coords.latitude, longitude: fallback.coords.longitude };
  }

  throw new Error('Unable to read device location');
}
