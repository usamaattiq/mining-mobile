const apiUrl = process.env.EXPO_PUBLIC_API_URL;

if (!apiUrl) {
  console.warn('[env] EXPO_PUBLIC_API_URL is not set — falling back to http://localhost:4000/api');
}

export const env = {
  API_URL: apiUrl ?? 'http://localhost:4000/api',
};

const legacyMapsKey = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY?.trim();
const androidMapsKey = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY_ANDROID?.trim() || legacyMapsKey;
const iosMapsKey = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY_IOS?.trim() || legacyMapsKey;

export function hasGoogleMapsApiKey(): boolean {
  return Boolean(androidMapsKey || iosMapsKey);
}
