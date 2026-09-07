import React from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { i18n as appI18n } from '@/i18n';
import { useLanguage } from '@/i18n/hooks/useLanguage';
import { AppText } from '@/shared/components/AppText';
import { legalDocuments, type LegalDocumentKind } from '@/shared/constants/legalContent';
import { palette, radius, spacing } from '@/shared/theme/tokens';

type LegalDocumentSheetProps = {
  visible: boolean;
  doc: LegalDocumentKind | null;
  onClose: () => void;
};

export function LegalDocumentSheet({
  visible,
  doc,
  onClose,
}: LegalDocumentSheetProps): React.ReactElement {
  const { t } = useTranslation(undefined, { i18n: appI18n });
  const { currentLanguage } = useLanguage();
  const { height } = useWindowDimensions();
  const sheetHeight = Math.round(height * 0.78);
  const document = legalDocuments[currentLanguage][doc ?? 'privacy'];

  return (
    <Modal visible={visible && doc !== null} animationType="slide" transparent onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <View style={[styles.sheet, { height: sheetHeight }]}>
        <View style={styles.handle} />

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
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(34, 34, 34, 0.4)',
  },
  sheet: {
    backgroundColor: palette.pureWhite,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: radius.sm,
    backgroundColor: palette.softGold,
    marginBottom: spacing.sm,
  },
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
