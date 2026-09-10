import { Platform } from 'react-native';

/** Standard elevated-card shadow, matching stride-mobile's cardBackShadow token. */
export const cardBackShadow = Platform.select({
  ios: {
    shadowColor: '#000000',
    shadowOpacity: 0.12,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 18,
  },
  android: {
    elevation: 12,
  },
  default: {},
}) as object;
