import type { SupportedLanguageCode } from '@/i18n/constants/languages';

export type FontWeightToken = 'regular' | 'medium' | 'semibold' | 'bold';

export const fontFamilies = {
  en: {
    regular: 'Outfit-Regular',
    medium: 'Outfit-Medium',
    semibold: 'Outfit-SemiBold',
    bold: 'Outfit-Bold',
  },
  ar: {
    regular: 'Cairo-Regular',
    medium: 'Cairo-Medium',
    semibold: 'Cairo-SemiBold',
    bold: 'Cairo-Bold',
  },
} as const satisfies Record<SupportedLanguageCode, Record<FontWeightToken, string>>;

export const appFontAssets = {
  'Outfit-Regular': require('@expo-google-fonts/outfit/400Regular/Outfit_400Regular.ttf'),
  'Outfit-Medium': require('@expo-google-fonts/outfit/500Medium/Outfit_500Medium.ttf'),
  'Outfit-SemiBold': require('@expo-google-fonts/outfit/600SemiBold/Outfit_600SemiBold.ttf'),
  'Outfit-Bold': require('@expo-google-fonts/outfit/700Bold/Outfit_700Bold.ttf'),
  'Cairo-Regular': require('@expo-google-fonts/cairo/400Regular/Cairo_400Regular.ttf'),
  'Cairo-Medium': require('@expo-google-fonts/cairo/500Medium/Cairo_500Medium.ttf'),
  'Cairo-SemiBold': require('@expo-google-fonts/cairo/600SemiBold/Cairo_600SemiBold.ttf'),
  'Cairo-Bold': require('@expo-google-fonts/cairo/700Bold/Cairo_700Bold.ttf'),
} as const;

export const getFontFamily = (
  language: SupportedLanguageCode,
  weight: FontWeightToken = 'regular',
): string => {
  const languageFonts = fontFamilies[language];
  const selected = languageFonts[weight];

  if (!selected) {
    if (__DEV__) {
      console.warn(`[typography] Missing font weight mapping: ${language}.${weight}`);
    }

    return languageFonts.regular;
  }

  return selected;
};
