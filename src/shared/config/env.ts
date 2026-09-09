const apiUrl = process.env.EXPO_PUBLIC_API_URL;

if (!apiUrl) {
  console.warn('[env] EXPO_PUBLIC_API_URL is not set — falling back to http://localhost:4000/api');
}

export const env = {
  API_URL: apiUrl ?? 'http://localhost:4000/api',
  /** Must match mining-api's AWS_S3_PUBLIC_BASE_URL so uploaded keys resolve in the app. */
  s3PublicBaseUrl: process.env.EXPO_PUBLIC_S3_PUBLIC_BASE_URL,
};

/** Single client Maps key (WebView Maps JS + Geocoding search). */
export const googleMapsJsApiKey = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY?.trim() ?? '';

export function hasGoogleMapsApiKey(): boolean {
  return Boolean(googleMapsJsApiKey);
}
