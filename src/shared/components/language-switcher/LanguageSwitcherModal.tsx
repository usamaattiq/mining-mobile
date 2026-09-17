import React from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { i18n as appI18n } from '@/i18n';
import { AppText } from '@/shared/components/AppText';
import { palette, radius, spacing } from '@/theme';
import { getFontFamily } from '@/theme';
import type { LanguageOption, LanguageSwitcherModalProps } from './types/language-switcher.types';

// EN/AR short codes stay in the Latin face regardless of active language.
const SHORT_LABEL_FONT = getFontFamily('en', 'semibold');

function LanguageOptionRow({
  option,
  selected,
  onPress,
}: {
  option: LanguageOption;
  selected: boolean;
  onPress: () => void;
}): React.ReactElement {
  return (
    <Pressable onPress={onPress} style={[styles.optionRow, selected && styles.optionRowSelected]}>
      <Text style={styles.optionFlag}>{option.flag}</Text>
      <AppText weight="medium" style={styles.optionLabel}>
        {option.label}
      </AppText>
      <Text style={styles.optionShort}>{option.shortLabel}</Text>
      {selected ? <Ionicons name="checkmark" size={16} color={palette.gold} /> : null}
    </Pressable>
  );
}

export function LanguageSwitcherModal({
  visible,
  currentLanguage,
  options,
  onClose,
  onSelectLanguage,
}: LanguageSwitcherModalProps): React.ReactElement {
  const { t } = useTranslation(undefined, { i18n: appI18n });

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      navigationBarTranslucent
      onRequestClose={onClose}
    >
      <View style={styles.root}>
        <Pressable
          style={styles.backdrop}
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel={t('common.cancel')}
        />
        <View style={styles.card}>
          <View style={styles.header}>
            <AppText weight="bold" style={styles.title}>
              {t('language.selectLanguage')}
            </AppText>
            <Pressable
              onPress={onClose}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel={t('common.cancel')}
            >
              <Ionicons name="close" size={18} color={palette.muted} />
            </Pressable>
          </View>
          <View style={styles.optionsWrap}>
            {options.map((option) => (
              <LanguageOptionRow
                key={option.code}
                option={option}
                selected={option.code === currentLanguage}
                onPress={() => onSelectLanguage(option.code)}
              />
            ))}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(34, 34, 34, 0.45)',
  },
  card: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: palette.pureWhite,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  title: {
    fontSize: 17,
    color: palette.charcoal,
  },
  optionsWrap: {
    gap: spacing.sm,
  },
  optionRow: {
    minHeight: 52,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: palette.softGold,
    paddingHorizontal: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  optionRowSelected: {
    borderColor: palette.gold,
    backgroundColor: palette.softGold,
  },
  optionFlag: {
    fontSize: 18,
  },
  optionLabel: {
    flex: 1,
    fontSize: 14,
    color: palette.charcoal,
  },
  optionShort: {
    fontFamily: SHORT_LABEL_FONT,
    fontSize: 12,
    color: palette.muted,
    letterSpacing: 0.5,
  },
});
