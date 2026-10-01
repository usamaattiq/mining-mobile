import type { SupportedLanguageCode } from '@/i18n/constants/languages';

export type LanguageOption = {
  code: SupportedLanguageCode;
  label: string;
  shortLabel: string;
  flag: string;
};

export type LanguageSwitcherTriggerProps = {
  language: LanguageOption;
  onPress: () => void;
};

export type LanguageSwitcherModalProps = {
  visible: boolean;
  currentLanguage: SupportedLanguageCode;
  options: readonly LanguageOption[];
  onClose: () => void;
  onSelectLanguage: (language: SupportedLanguageCode) => void;
};
