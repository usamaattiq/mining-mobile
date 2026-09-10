import React from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { i18n as appI18n } from '@/i18n';
import type { RootStackParamList } from '@/navigation/types';
import { authApi } from '@/features/auth/api/authApi';
import { useProfileStore } from '@/store/profileStore';
import { AppTopBar } from '@/shared/components/AppTopBar';
import { FormInput } from '@/shared/components/FormInput';
import { Button } from '@/shared/components/Button';
import { palette, spacing } from '@/theme';

type Props = NativeStackScreenProps<RootStackParamList, 'PersonalInformation'>;

export function PersonalInformationScreen({ navigation }: Props): React.ReactElement {
  const { t } = useTranslation(undefined, { i18n: appI18n });
  const profile = useProfileStore((state) => state.profile);
  const setProfile = useProfileStore((state) => state.setProfile);

  const [fullName, setFullName] = React.useState(profile?.fullName ?? '');
  const [email, setEmail] = React.useState(profile?.email ?? '');
  const [address, setAddress] = React.useState(profile?.address ?? '');
  const [saving, setSaving] = React.useState(false);

  const hasChanges =
    fullName.trim() !== (profile?.fullName ?? '') ||
    email.trim() !== (profile?.email ?? '') ||
    address.trim() !== (profile?.address ?? '');

  const handleSave = async () => {
    setSaving(true);
    try {
      const updated = await authApi.updateMe({
        fullName: fullName.trim(),
        email: email.trim() || null,
        address: address.trim() || null,
      });
      setProfile(updated);
      navigation.goBack();
    } catch {
      Alert.alert(t('common.error'), t('profile.saveError'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.root}>
      <AppTopBar left="back" title={t('profile.personalInformation')} onBackPress={navigation.goBack} />

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <FormInput label={t('profile.fullName')} value={fullName} onChangeText={setFullName} />
        <FormInput
          label={t('profile.email')}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <FormInput label={t('profile.phone')} value={profile?.phoneE164 ?? ''} editable={false} />
        <FormInput label={t('profile.address')} value={address} onChangeText={setAddress} />
      </ScrollView>

      <View style={styles.footer}>
        <Button
          label={t('common.save')}
          onPress={() => void handleSave()}
          loading={saving}
          disabled={!hasChanges || saving}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: palette.warmWhite,
  },
  content: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  footer: {
    padding: spacing.lg,
  },
});
