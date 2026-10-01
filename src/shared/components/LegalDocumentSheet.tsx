import React from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { i18n as appI18n } from '@/i18n';
import { useLanguage } from '@/i18n/hooks/useLanguage';
import { AppText } from '@/shared/components/AppText';
import { AppBottomSheet } from '@/shared/components/AppBottomSheet';
import { legalDocuments } from '@/shared/constants/legalContent';
import { palette, spacing } from '@/theme';
import type { LegalDocumentSheetProps } from '@/shared/types/legalDocumentSheet.types';

export function LegalDocumentSheet({
  visible,
  doc,
  onClose,
}: LegalDocumentSheetProps): React.ReactElement {
  const { t } = useTranslation(undefined, { i18n: appI18n });
  const { currentLanguage } = useLanguage();
  const document = legalDocuments[currentLanguage][doc ?? 'privacy'];

  return (
    <AppBottomSheet visible={visible && doc !== null} onClose={onClose} heightRatio={0.78}>
      <View style={styles.header}>
        <View style={styles.headerSpacer} />
        <AppText weight="bold" style={styles.title}>
          {document.title}
        </AppText>
        <Pressable
          onPress={onClose}
          hitSlop={8}
          style={styles.closeButton}
          accessibilityRole="button"
          accessibilityLabel={t('common.close')}
        >
          <Ionicons name="close" size={22} color={palette.muted} />
        </Pressable>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <AppText style={styles.updated}>
          {t('legal.updatedTemplate', {
            effective: document.effectiveDate,
            updated: document.lastUpdated,
          })}
        </AppText>
        <AppText style={styles.intro}>{document.intro}</AppText>

        {document.sections.map((section) => (
          <View key={section.heading} style={styles.section}>
            <AppText weight="semibold" style={styles.sectionTitle}>
              {section.heading}
            </AppText>
            {section.paragraphs?.map((paragraph) => (
              <AppText key={paragraph} style={styles.sectionBody}>
                {paragraph}
              </AppText>
            ))}
            {section.bullets?.map((bullet) => (
              <View key={bullet} style={styles.bulletRow}>
                <AppText style={styles.bulletDot}>{'•'}</AppText>
                <AppText style={styles.sectionBody}>{bullet}</AppText>
              </View>
            ))}
          </View>
        ))}
      </ScrollView>
    </AppBottomSheet>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: spacing.sm,
  },
  headerSpacer: {
    width: 36,
  },
  closeButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    flex: 1,
    fontSize: 17,
    color: palette.charcoal,
    textAlign: 'center',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing.lg,
    gap: spacing.md,
  },
  updated: {
    fontSize: 12,
    color: palette.muted,
  },
  intro: {
    fontSize: 14,
    lineHeight: 22,
    color: palette.charcoal,
  },
  section: {
    gap: spacing.xs,
  },
  sectionTitle: {
    fontSize: 15,
    color: palette.charcoal,
  },
  sectionBody: {
    flex: 1,
    fontSize: 14,
    lineHeight: 22,
    color: palette.muted,
  },
  bulletRow: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  bulletDot: {
    fontSize: 14,
    lineHeight: 22,
    color: palette.muted,
  },
});
