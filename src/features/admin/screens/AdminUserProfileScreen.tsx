import React from 'react';
import { ActivityIndicator, Image, StyleSheet, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { i18n as appI18n } from '@/i18n';
import type { RootStackParamList } from '@/navigation/types';
import { GoldSheetScreen } from '@/features/dashboard/components/GoldSheetScreen';
import { adminApi, type AdminUserDetail } from '@/features/admin/api/adminApi';
import { FormInput } from '@/shared/components/FormInput';
import { Button } from '@/shared/components/Button';
import { AppText } from '@/shared/components/AppText';
import { showAppAlert } from '@/shared/services/appAlert';
import { palette, radius, spacing } from '@/theme';

type Props = NativeStackScreenProps<RootStackParamList, 'AdminUserProfile'>;

export function AdminUserProfileScreen({ navigation, route }: Props): React.ReactElement {
  const { t } = useTranslation(undefined, { i18n: appI18n });
  const [detail, setDetail] = React.useState<AdminUserDetail | null>(null);
  const [fullName, setFullName] = React.useState('');
  const [companyName, setCompanyName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [address, setAddress] = React.useState('');
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    void adminApi
      .getUser(route.params.userId)
      .then((user) => {
        setDetail(user);
        setFullName(user.fullName);
        setCompanyName(user.companyName ?? '');
        setEmail(user.email ?? '');
        setAddress(user.address ?? '');
      })
      .catch(() => showAppAlert(t('admin.loadFailed')));
  }, [route.params.userId, t]);

  const save = async () => {
    if (!detail) return;
    setSaving(true);
    try {
      await adminApi.updateUser(detail.id, {
        fullName: fullName.trim(),
        email: email.trim() || null,
        address: address.trim() || null,
        companyName: detail.accountType === 'company' ? companyName.trim() || null : undefined,
        latitude: detail.latitude,
        longitude: detail.longitude,
      });
      navigation.goBack();
    } catch {
      showAppAlert(t('profile.saveError'));
    } finally {
      setSaving(false);
    }
  };

  const initial = detail?.fullName.trim().charAt(0).toUpperCase() || '?';

  return (
    <GoldSheetScreen
      left="back"
      title={t('profile.personalInformation')}
      onBackPress={navigation.goBack}
      keyboardShouldPersistTaps="handled"
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
            <AppText weight="bold" style={styles.heroName} numberOfLines={1}>
              {detail.fullName}
            </AppText>
            <AppText style={styles.heroPhone}>{detail.phoneE164}</AppText>
          </View>
        ) : null
      }
    >
      {!detail ? (
        <ActivityIndicator color={palette.gold} style={styles.loader} />
      ) : (
        <View style={styles.card}>
          <FormInput label={t('profile.fullName')} value={fullName} onChangeText={setFullName} />
          {detail.accountType === 'company' ? (
            <FormInput
              label={t('profile.companyName')}
              value={companyName}
              onChangeText={setCompanyName}
            />
          ) : null}
          <FormInput label={t('profile.email')} value={email} onChangeText={setEmail} />
          <FormInput label={t('profile.address')} value={address} onChangeText={setAddress} />
          <Button label={t('common.save')} onPress={() => void save()} loading={saving} />
        </View>
      )}
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
  heroName: { fontSize: 22, color: palette.pureWhite, textAlign: 'center' },
  heroPhone: { fontSize: 14, color: 'rgba(255, 255, 255, 0.9)', textAlign: 'center' },
  loader: { marginTop: spacing.xl },
  card: {
    backgroundColor: palette.warmWhite,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: palette.softGold,
    padding: spacing.md,
    gap: spacing.sm,
  },
});
