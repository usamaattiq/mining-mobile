import ICU from 'i18next-icu';
import i18n from 'i18next';
import ar from './locales/ar.json';
import en from './locales/en.json';
import { DEFAULT_LANGUAGE, type SupportedLanguageCode } from './constants/languages';
import { syncBundledTranslations } from './syncBundledTranslations';
import { assertValidTranslationTree, type TranslationTree } from './utils/translationValidation';

export const I18N_NAMESPACE = 'translation';
export const I18N_FALLBACK_CHAIN = [DEFAULT_LANGUAGE] as const;

export const bundledTranslations: Record<SupportedLanguageCode, TranslationTree> = {
  en,
  ar,
};

Object.values(bundledTranslations).forEach((translations) => {
  assertValidTranslationTree(translations);
});

// Re-merge locale files after Metro hot reload (initializeI18n only runs once).
if (i18n.isInitialized) {
  syncBundledTranslations(i18n, I18N_NAMESPACE, bundledTranslations);
}

export const i18nPlugins = [new ICU()] as const;
