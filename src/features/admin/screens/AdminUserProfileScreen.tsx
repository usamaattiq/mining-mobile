import React from 'react';
import { ActivityIndicator, StyleSheet } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { i18n as appI18n } from '@/i18n';
import type { RootStackParamList } from '@/navigation/types';
import { GoldSheetScreen } from '@/features/dashboard/components/GoldSheetScreen';
import { adminApi, type AdminUserDetail } from '@/features/admin/api/adminApi';
import { FormInput } from '@/shared/components/FormInput';
import { Button } from '@/shared/components/Button';
import { showAppAlert } from '@/shared/services/appAlert';
import { palette, spacing } from '@/theme';

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

  return (
    <GoldSheetScreen
      left="back"
      title={t('profile.personalInformation')}
      onBackPress={navigation.goBack}
      keyboardShouldPersistTaps="handled"
    >
      {!detail ? (
        <ActivityIndicator color={palette.gold} style={styles.loader} />
      ) : (
        <>
          <FormInput label={t('profile.phone')} value={detail.phoneE164} editable={false} />
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
        </>
      )}
    </GoldSheetScreen>
  );
}

const styles = StyleSheet.create({
  loader: { marginTop: spacing.xl },
});
