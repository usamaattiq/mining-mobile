import { Platform } from 'react-native';

const apiUrl = process.env.EXPO_PUBLIC_API_URL;

if (!apiUrl) {
  console.warn('[env] EXPO_PUBLIC_API_URL is not set — falling back to http://localhost:4000/api');
}

export const env = {
  API_URL: apiUrl ?? 'http://localhost:4000/api',
  /** Must match mining-api's AWS_S3_PUBLIC_BASE_URL so uploaded keys resolve in the app. */
  s3PublicBaseUrl: process.env.EXPO_PUBLIC_S3_PUBLIC_BASE_URL,
};

const legacyMapsKey = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY?.trim() ?? '';
const androidMapsKey = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY_ANDROID?.trim() || legacyMapsKey;
const iosMapsKey = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY_IOS?.trim() || legacyMapsKey;

/**
 * Client Maps key for WebView Maps JS + Geocoding search.
 * Prefers the platform EAS key (ANDROID / IOS), falls back to the shared key.
 */
export const googleMapsJsApiKey =
  (Platform.OS === 'ios' ? iosMapsKey : androidMapsKey) || legacyMapsKey;

export function hasGoogleMapsApiKey(): boolean {
  return Boolean(googleMapsJsApiKey);
}
