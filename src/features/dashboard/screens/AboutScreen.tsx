import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { i18n as appI18n } from '@/i18n';
import { AppTopBar } from '@/shared/components/AppTopBar';
import { CurvedSheetScrollView } from '@/features/dashboard/components/CurvedSheetScrollView';
import { palette, spacing } from '@/theme';

export function AboutScreen(): React.ReactElement {
  const { t } = useTranslation(undefined, { i18n: appI18n });

  return (
    <View style={styles.root}>
      <AppTopBar
        variant="gold"
        title={t('dashboardAbout.title')}
        titleAlign="left"
        titleSize="lg"
        style={styles.header}
      />
      <CurvedSheetScrollView />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: palette.gold,
  },
  header: {
    paddingBottom: spacing.xl,
  },
});
