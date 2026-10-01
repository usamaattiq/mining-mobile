import type { i18n as I18nInstance } from 'i18next';
import type { SupportedLanguageCode } from './constants/languages';
import type { TranslationTree } from './utils/translationValidation';

export const syncBundledTranslations = (
  i18nInstance: I18nInstance,
  namespace: string,
  bundles: Record<SupportedLanguageCode, TranslationTree>,
): void => {
  (Object.keys(bundles) as SupportedLanguageCode[]).forEach((language) => {
    if (i18nInstance.hasResourceBundle(language, namespace)) {
      i18nInstance.removeResourceBundle(language, namespace);
    }
    i18nInstance.addResourceBundle(language, namespace, bundles[language], true, true);
  });
};
