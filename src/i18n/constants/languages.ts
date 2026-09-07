export type SupportedLanguageCode = 'en' | 'ar';

export type SupportedLanguage = {
  code: SupportedLanguageCode;
  label: string;
  nativeLabel: string;
};

export const DEFAULT_LANGUAGE: SupportedLanguageCode = 'en';

export const SUPPORTED_LANGUAGES: readonly SupportedLanguage[] = [
  { code: 'en', label: 'English', nativeLabel: 'English' },
  { code: 'ar', label: 'Arabic', nativeLabel: 'العربية' },
] as const;

export const SUPPORTED_LANGUAGE_CODES = SUPPORTED_LANGUAGES.map(
  (language) => language.code,
) as SupportedLanguageCode[];

export const isSupportedLanguageCode = (value: string): value is SupportedLanguageCode =>
  SUPPORTED_LANGUAGE_CODES.includes(value as SupportedLanguageCode);
