import i18n, { type InitOptions, type Resource } from 'i18next';
import { initReactI18next } from 'react-i18next';
import type { SupportedLanguageCode } from './constants/languages';
import { I18N_FALLBACK_CHAIN, I18N_NAMESPACE, i18nPlugins } from './config';
import { languageService } from './services/language.service';
import { syncBundledTranslations } from './syncBundledTranslations';
import type { TranslationTree } from './utils/translationValidation';

let initializationPromise: Promise<typeof i18n> | null = null;

/** Reload locale JSON from disk (picks up Metro updates after en/ar.json edits). */
function loadFreshBundles(): Record<SupportedLanguageCode, TranslationTree> {
  return {
    en: require('./locales/en.json'),
    ar: require('./locales/ar.json'),
  };
}

export function refreshBundledTranslations(): void {
  if (!i18n.isInitialized) {
    return;
  }
  syncBundledTranslations(i18n, I18N_NAMESPACE, loadFreshBundles());
}

const buildResources = (): Resource => {
  const bundles = loadFreshBundles();
  return {
    en: { [I18N_NAMESPACE]: bundles.en },
    ar: { [I18N_NAMESPACE]: bundles.ar },
  };
};

export const initializeI18n = async (): Promise<typeof i18n> => {
  if (i18n.isInitialized) {
    refreshBundledTranslations();
    return i18n;
  }

  if (initializationPromise) {
    return initializationPromise;
  }

  initializationPromise = (async () => {
    const initialLanguage = await languageService.resolveInitialLanguage();

    i18nPlugins.forEach((plugin) => {
      i18n.use(plugin);
    });

    const initOptions: InitOptions = {
      lng: initialLanguage,
      fallbackLng: [...I18N_FALLBACK_CHAIN],
      defaultNS: I18N_NAMESPACE,
      ns: [I18N_NAMESPACE],
      resources: buildResources(),
      interpolation: {
        escapeValue: false,
      },
      returnNull: false,
      missingKeyHandler: (_lng: readonly string[], _ns: string, key: string) => {
        if (__DEV__) {
          console.warn(`[i18n] Missing translation key: ${key}`);
        }
      },
      saveMissing: __DEV__,
    };

    await i18n.use(initReactI18next).init(initOptions);
    refreshBundledTranslations();
    await languageService.applyLanguage(initialLanguage);

    return i18n;
  })();

  return initializationPromise;
};

export { i18n };
