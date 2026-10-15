import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { i18n as appI18n } from '@/i18n';
import { GoldSheetScreen } from '@/features/dashboard/components/GoldSheetScreen';
import { adminApi } from '@/features/admin/api/adminApi';
import { AppText } from '@/shared/components/AppText';
import { showAppAlert } from '@/shared/services/appAlert';
import { palette, radius, spacing } from '@/theme';

export function AdminSystemMessageScreen(): React.ReactElement {
  const { t } = useTranslation(undefined, { i18n: appI18n });
  const navigation = useNavigation();
  const [messageOnSend, setMessageOnSend] = React.useState(true);

  React.useEffect(() => {
    void adminApi
      .settings()
      .then((settings) => setMessageOnSend(settings.messageOnSend))
      .catch(() => undefined);
  }, []);

  return (
    <GoldSheetScreen
      title={t('admin.sectionMessage')}
      titleAlign="left"
      titleSize="lg"
      left="back"
      onBackPress={() => navigation.goBack()}
      headerStyle={styles.header}
    >
      <View style={styles.settingRow}>
        <View style={styles.settingCopy}>
          <AppText weight="semibold" style={styles.settingTitle}>
            {t('admin.messageOnSend')}
          </AppText>
          <AppText style={styles.settingHint}>{t('admin.messageOnSendHint')}</AppText>
        </View>
        <Pressable
          accessibilityRole="switch"
          accessibilityState={{ checked: messageOnSend }}
          onPress={() => {
            const next = !messageOnSend;
            setMessageOnSend(next);
            void adminApi.setMessageOnSend(next).catch(() => {
              setMessageOnSend(!next);
              showAppAlert(t('common.error'));
            });
          }}
          style={[styles.toggle, messageOnSend && styles.toggleOn]}
        >
          <View style={styles.toggleThumb} />
        </Pressable>
      </View>
    </GoldSheetScreen>
  );
}

const styles = StyleSheet.create({
  header: { paddingBottom: spacing.xl },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: palette.pureWhite,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: palette.softGold,
    padding: spacing.md,
  },
  settingCopy: { flex: 1, gap: 2 },
  settingTitle: { fontSize: 15, color: palette.charcoal },
  settingHint: { fontSize: 12, color: palette.muted },
  toggle: {
    width: 48,
    height: 28,
    borderRadius: 14,
    padding: 3,
    backgroundColor: '#D9D3C7',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  toggleOn: {
    backgroundColor: palette.gold,
    justifyContent: 'flex-end',
  },
  toggleThumb: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: palette.pureWhite,
  },
});
