import React from 'react';
import { ActivityIndicator, Image, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { i18n as appI18n } from '@/i18n';
import type { RootStackParamList } from '@/navigation/types';
import { GoldSheetScreen } from '@/features/dashboard/components/GoldSheetScreen';
import { adminApi, type AdminUserDetail } from '@/features/admin/api/adminApi';
import { Button } from '@/shared/components/Button';
import { AppText } from '@/shared/components/AppText';
import { showAppAlert } from '@/shared/services/appAlert';
import { openWhatsApp } from '@/shared/utils/openWhatsApp';
import { cardBackShadow, palette, radius, spacing } from '@/theme';

type Props = NativeStackScreenProps<RootStackParamList, 'AdminUserProfile'>;

export function AdminUserProfileScreen({ navigation, route }: Props): React.ReactElement {
  const { t } = useTranslation(undefined, { i18n: appI18n });
  const [detail, setDetail] = React.useState<AdminUserDetail | null>(null);
  const [blocking, setBlocking] = React.useState(false);

  React.useEffect(() => {
    void adminApi
      .getUser(route.params.userId)
      .then(setDetail)
      .catch(() => showAppAlert(t('admin.loadFailed')));
  }, [route.params.userId, t]);

  const blocked = detail?.status === 'suspended';

  const blockUser = () => {
    if (!detail) return;
    const next = blocked ? 'active' : 'suspended';
    showAppAlert(
      blocked ? t('admin.unblockUser') : t('admin.blockUser'),
      blocked ? t('admin.unblockUserConfirm') : t('admin.blockUserConfirm'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.confirm'),
          style: blocked ? 'default' : 'destructive',
          onPress: () => {
            setBlocking(true);
            void adminApi
              .setUserStatus(detail.id, next)
              .then(() => setDetail({ ...detail, status: next }))
              .catch(() => showAppAlert(t('profile.saveError')))
              .finally(() => setBlocking(false));
          },
        },
      ],
    );
  };

  const initial = detail?.fullName.trim().charAt(0).toUpperCase() || '?';
  const rows = detail
    ? [
        { icon: 'person-outline' as const, label: t('profile.fullName'), value: detail.fullName },
        {
          icon: 'id-card-outline' as const,
          label: t('admin.accountType'),
          value: detail.accountType === 'company' ? t('admin.company') : t('admin.individual'),
        },
        ...(detail.accountType === 'company'
          ? [
              {
                icon: 'business-outline' as const,
                label: t('profile.companyName'),
                value: detail.companyName,
              },
            ]
          : []),
        { icon: 'mail-outline' as const, label: t('profile.email'), value: detail.email },
        { icon: 'call-outline' as const, label: t('profile.phone'), value: detail.phoneE164 },
        { icon: 'location-outline' as const, label: t('profile.address'), value: detail.address },
      ].filter((row) => row.value)
    : [];

  return (
    <GoldSheetScreen
      left="back"
      title={t('profile.personalInformation')}
      onBackPress={navigation.goBack}
      headerStyle={styles.header}
      headerExtra={
        detail ? (
          <View style={styles.hero}>
            <View style={styles.avatarRing}>
              {detail.avatarUrl ? (
                <Image source={{ uri: detail.avatarUrl }} style={styles.avatar} />
              ) : (
                <AppText weight="bold" style={styles.initial}>
                  {initial}
                </AppText>
              )}
            </View>
          </View>
        ) : null
      }
    >
      {!detail ? (
        <ActivityIndicator color={palette.gold} style={styles.loader} />
      ) : (
        <View style={[styles.card, cardBackShadow]}>
          {rows.map((row, index) => (
            <View key={row.label} style={[styles.row, index > 0 && styles.rowDivider]}>
              <View style={styles.iconWrap}>
                <Ionicons name={row.icon} size={18} color={palette.gold} />
              </View>
              <View style={styles.rowCopy}>
                <AppText style={styles.label}>{row.label}</AppText>
                <AppText weight="semibold" style={styles.value}>
                  {row.value}
                </AppText>
              </View>
            </View>
          ))}
          <Button
            label={t('common.whatsapp')}
            icon="logo-whatsapp"
            variant="whatsapp"
            onPress={() => openWhatsApp(detail.phoneE164)}
          />
        </View>
      )}
      {detail ? (
        <Button
          label={blocked ? t('admin.unblockUser') : t('admin.blockUser')}
          variant="outline"
          onPress={blockUser}
          loading={blocking}
        />
      ) : null}
    </GoldSheetScreen>
  );
}

const styles = StyleSheet.create({
  header: { paddingBottom: spacing.sm },
  hero: {
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl + spacing.sm,
    backgroundColor: palette.gold,
    gap: spacing.xs,
  },
  avatarRing: {
    width: 108,
    height: 108,
    borderRadius: 54,
    borderWidth: 3,
    borderColor: palette.pureWhite,
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    marginBottom: spacing.sm,
  },
  avatar: { width: '100%', height: '100%' },
  initial: { fontSize: 40, color: palette.pureWhite },
  loader: { marginTop: spacing.xl },
  card: {
    backgroundColor: palette.warmWhite,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: palette.softGold,
    padding: spacing.md,
    gap: spacing.sm,
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.xs },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.softGold,
  },
  rowCopy: { flex: 1, gap: 2, minWidth: 0 },
  rowDivider: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: palette.softGold,
    paddingTop: spacing.sm,
  },
  label: { fontSize: 12, color: palette.charcoal, opacity: 0.6 },
  value: { fontSize: 16, color: palette.charcoal },
});
