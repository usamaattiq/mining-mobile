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

export function AdminSystemRequestsScreen(): React.ReactElement {
  const { t } = useTranslation(undefined, { i18n: appI18n });
  const navigation = useNavigation();
  const [rfq, setRfq] = React.useState(true);
  const [auction, setAuction] = React.useState(true);

  React.useEffect(() => {
    void adminApi
      .settings()
      .then((settings) => {
        setRfq(settings.buyerEquipmentRfq);
        setAuction(settings.buyerEquipmentAuction);
      })
      .catch(() => undefined);
  }, []);

  const toggle = (mode: 'rfq' | 'auction') => {
    const next = mode === 'rfq' ? !rfq : !auction;
    if (!next && (mode === 'rfq' ? !auction : !rfq)) {
      showAppAlert(t('admin.buyerRequestKeepOne'));
      return;
    }
    if (mode === 'rfq') setRfq(next);
    else setAuction(next);
    void adminApi
      .setBuyerEquipmentMode(mode, next)
      .then((settings) => {
        setRfq(settings.buyerEquipmentRfq);
        setAuction(settings.buyerEquipmentAuction);
      })
      .catch(() => {
        if (mode === 'rfq') setRfq(!next);
        else setAuction(!next);
        showAppAlert(t('common.error'));
      });
  };

  return (
    <GoldSheetScreen
      title={t('admin.sectionBuyerRequests')}
      titleAlign="left"
      titleSize="lg"
      left="back"
      onBackPress={() => navigation.goBack()}
      headerStyle={styles.header}
    >
      <View style={styles.list}>
        <SettingToggle
          title={t('admin.buyerRequestRfq')}
          hint={t('admin.buyerRequestRfqHint')}
          on={rfq}
          onPress={() => toggle('rfq')}
        />
        <SettingToggle
          title={t('admin.buyerRequestAuction')}
          hint={t('admin.buyerRequestAuctionHint')}
          on={auction}
          onPress={() => toggle('auction')}
        />
      </View>
    </GoldSheetScreen>
  );
}

function SettingToggle({
  title,
  hint,
  on,
  onPress,
}: {
  title: string;
  hint: string;
  on: boolean;
  onPress: () => void;
}): React.ReactElement {
  return (
    <View style={styles.settingRow}>
      <View style={styles.settingCopy}>
        <AppText weight="semibold" style={styles.settingTitle}>
          {title}
        </AppText>
        <AppText style={styles.settingHint}>{hint}</AppText>
      </View>
      <Pressable
        accessibilityRole="switch"
        accessibilityState={{ checked: on }}
        onPress={onPress}
        style={[styles.toggle, on && styles.toggleOn]}
      >
        <View style={styles.toggleThumb} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { paddingBottom: spacing.xl },
  list: { gap: spacing.sm },
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
