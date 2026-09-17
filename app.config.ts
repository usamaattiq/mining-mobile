import type { ExpoConfig } from 'expo/config';
import appJson from './app.json';

const baseExpo = appJson.expo as ExpoConfig;

// Match EAS production vars (and Stride): platform-specific Maps keys, with a
// single-key fallback for local .env development.
const legacyMapsKey = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY?.trim();
const androidMapsKey =
  process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY_ANDROID?.trim() || legacyMapsKey || '';
const iosMapsKey =
  process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY_IOS?.trim() || legacyMapsKey || '';

if (process.env.NODE_ENV === 'production' && !androidMapsKey && !iosMapsKey) {
  console.warn(
    '[app.config] Google Maps API keys are missing — set EXPO_PUBLIC_GOOGLE_MAPS_API_KEY_ANDROID and EXPO_PUBLIC_GOOGLE_MAPS_API_KEY_IOS on EAS.',
  );
}

const config: ExpoConfig = {
  ...baseExpo,
  plugins: [
    ...(baseExpo.plugins ?? []),
    'expo-secure-store',
    [
      'expo-notifications',
      {
        // Use the tracked app icon so EAS always has this file (a separate
        // notification-icon.png was easy to miss in the upload archive).
        icon: './assets/images/icon.png',
        color: '#222222',
        defaultChannel: 'default',
      },
    ],
    [
      'expo-local-authentication',
      {
        faceIDPermission:
          'Allow $(PRODUCT_NAME) to use Face ID to sign you in quickly and securely.',
      },
    ],
    [
      'expo-image-picker',
      {
        photosPermission: 'Allow $(PRODUCT_NAME) to access your photos to set a profile picture.',
        cameraPermission: 'Allow $(PRODUCT_NAME) to access your camera to take a profile picture.',
      },
    ],
    '@react-native-community/datetimepicker',
    'expo-sharing',
    'expo-video',
    [
      'expo-location',
      {
        locationWhenInUsePermission:
          'Allow $(PRODUCT_NAME) to use your location to find your address.',
      },
    ],
    // SDK 57+: maps keys must go through this plugin. Legacy
    // ios.config.googleMapsApiKey makes prebuild request the removed
    // `react-native-google-maps` podspec and fails Install pods.
    [
      'react-native-maps',
      {
        ...(androidMapsKey ? { androidGoogleMapsApiKey: androidMapsKey } : {}),
        ...(iosMapsKey ? { iosGoogleMapsApiKey: iosMapsKey } : {}),
      },
    ],
  ],
  android: {
    ...baseExpo.android,
    softwareKeyboardLayoutMode: 'resize',
    intentFilters: [
      ...(baseExpo.android?.intentFilters ?? []),
      {
        action: 'VIEW',
        category: ['BROWSABLE', 'DEFAULT'],
        data: [
          { scheme: 'miningmobile', host: 'home' },
          { scheme: 'miningmobile', host: 'requests' },
          { scheme: 'miningmobile', host: 'requests', pathPrefix: '/' },
          { scheme: 'miningmobile', host: 'conversation', pathPrefix: '/' },
          { scheme: 'miningmobile', host: 'listing', pathPrefix: '/' },
          { scheme: 'miningmobile', host: 'messages' },
          { scheme: 'miningmobile', host: 'notifications' },
          { scheme: 'miningmobile', host: 'offers' },
        ],
      },
    ],
    permissions: [
      ...(baseExpo.android?.permissions ?? []),
      'android.permission.POST_NOTIFICATIONS',
      'android.permission.RECEIVE_BOOT_COMPLETED',
      'android.permission.VIBRATE',
    ],
  },
  ios: {
    ...baseExpo.ios,
    supportsTablet: false,
    infoPlist: {
      ...baseExpo.ios?.infoPlist,
      ITSAppUsesNonExemptEncryption: false,
    },
  },
};

export default config;
