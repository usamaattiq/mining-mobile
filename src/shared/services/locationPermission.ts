import * as Location from 'expo-location';

export async function ensureLocationPermission(): Promise<boolean> {
  const existing = await Location.getForegroundPermissionsAsync();
  if (existing.status === Location.PermissionStatus.GRANTED) return true;

  const requested = await Location.requestForegroundPermissionsAsync();
  return requested.status === Location.PermissionStatus.GRANTED;
}
