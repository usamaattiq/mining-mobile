import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { i18n as appI18n } from '@/i18n';
import { AppText } from '@/shared/components/AppText';
import { palette, spacing } from '@/shared/theme/tokens';

export function HomeScreen(): React.ReactElement {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation(undefined, { i18n: appI18n });

  return (
    <View style={[styles.root, { paddingTop: insets.top + spacing.xl }]}>
      <AppText weight="bold" style={styles.title}>
        {t('dashboardHome.title')}
      </AppText>
      <AppText style={styles.subtitle}>{t('dashboardHome.subtitle')}</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: palette.warmWhite,
    paddingHorizontal: spacing.lg,
  },
  title: {
    fontSize: 22,
    color: palette.charcoal,
  },
  subtitle: {
    marginTop: spacing.xs,
    fontSize: 14,
    color: palette.muted,
  },
});
