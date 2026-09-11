import type { ExpoConfig } from 'expo/config';
import appJson from './app.json';

const baseExpo = appJson.expo as ExpoConfig;

const googleMapsApiKey = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY?.trim() ?? '';

if (process.env.NODE_ENV === 'production' && !googleMapsApiKey) {
  console.warn(
    '[app.config] Google Maps API key is missing — set EXPO_PUBLIC_GOOGLE_MAPS_API_KEY on EAS.',
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
        icon: './assets/images/notification-icon.png',
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
  ],
  android: {
    ...baseExpo.android,
    softwareKeyboardLayoutMode: 'resize',
    intentFilters: [
      ...(baseExpo.android?.intentFilters ?? []),
      {
        action: 'VIEW',
        category: ['BROWSABLE', 'DEFAULT'],
        data: [{ scheme: 'miningmobile', host: 'requests' }],
      },
    ],
    permissions: [
      ...(baseExpo.android?.permissions ?? []),
      'android.permission.POST_NOTIFICATIONS',
      'android.permission.RECEIVE_BOOT_COMPLETED',
      'android.permission.VIBRATE',
    ],
    config: {
      ...baseExpo.android?.config,
      googleMaps: { apiKey: googleMapsApiKey },
    },
  },
  ios: {
    ...baseExpo.ios,
    supportsTablet: false,
    infoPlist: {
      ...baseExpo.ios?.infoPlist,
      ITSAppUsesNonExemptEncryption: false,
    },
    config: {
      ...baseExpo.ios?.config,
      googleMapsApiKey,
    },
  },
};

export default config;
