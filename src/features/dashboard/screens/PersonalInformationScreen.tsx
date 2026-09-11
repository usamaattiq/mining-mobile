import React from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { i18n as appI18n } from '@/i18n';
import type { RootStackParamList } from '@/navigation/types';
import { authApi } from '@/features/auth/api/authApi';
import { ApiError } from '@/shared/services/api';
import { useProfileStore } from '@/store/profileStore';
import { useLocationMapPicker } from '@/shared/hooks/useLocationMapPicker';
import { AppTopBar } from '@/shared/components/AppTopBar';
import { CurvedSheetScrollView } from '@/features/dashboard/components/CurvedSheetScrollView';
import { FormInput } from '@/shared/components/FormInput';
import { AvatarPicker } from '@/shared/components/AvatarPicker';
import { LocationField } from '@/shared/components/LocationField';
import { Button } from '@/shared/components/Button';
import { palette, spacing } from '@/theme';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Props = NativeStackScreenProps<RootStackParamList, 'PersonalInformation'>;

export function PersonalInformationScreen({ navigation }: Props): React.ReactElement {
  const { t } = useTranslation(undefined, { i18n: appI18n });
  const profile = useProfileStore((state) => state.profile);
  const setProfile = useProfileStore((state) => state.setProfile);

  const [fullName, setFullName] = React.useState(profile?.fullName ?? '');
  const [email, setEmail] = React.useState(profile?.email ?? '');
  const [address, setAddress] = React.useState(profile?.address ?? '');
  const [locationCoords, setLocationCoords] = React.useState<{
    latitude: number;
    longitude: number;
  } | null>(
    profile?.latitude != null && profile?.longitude != null
      ? { latitude: profile.latitude, longitude: profile.longitude }
      : null,
  );
  const [avatarUrl, setAvatarUrl] = React.useState(profile?.avatarUrl ?? null);
  const [saving, setSaving] = React.useState(false);
  const [emailServerError, setEmailServerError] = React.useState<string | null>(null);
  const { locationLoading, getCurrentLocation, openMapPickerForSelection, mapPickerSheet } =
    useLocationMapPicker();

  const trimmedEmail = email.trim();
  const isEmailFormatValid = trimmedEmail.length === 0 || EMAIL_REGEX.test(trimmedEmail);
  const emailError = emailServerError;

  const handleEmailChange = (next: string) => {
    setEmail(next);
    setEmailServerError(null);
  };

  const handleUseCurrentLocation = async () => {
    const selection = await getCurrentLocation();
    if (!selection) {
      Alert.alert(t('common.error'), t('location.locationFailed'));
      return;
    }
    setAddress(selection.label);
    setLocationCoords({ latitude: selection.latitude, longitude: selection.longitude });
  };

  const handleSelectOnMap = () => {
    openMapPickerForSelection((selection) => {
      setAddress(selection.label);
      setLocationCoords({ latitude: selection.latitude, longitude: selection.longitude });
    }, locationCoords);
  };

  const profileLocationCoords =
    profile?.latitude != null && profile?.longitude != null
      ? { latitude: profile.latitude, longitude: profile.longitude }
      : null;

  const hasChanges =
    fullName.trim() !== (profile?.fullName ?? '') ||
    trimmedEmail !== (profile?.email ?? '') ||
    address.trim() !== (profile?.address ?? '') ||
    locationCoords?.latitude !== profileLocationCoords?.latitude ||
    locationCoords?.longitude !== profileLocationCoords?.longitude ||
    avatarUrl !== (profile?.avatarUrl ?? null);

  const handleSave = async () => {
    if (emailError || !isEmailFormatValid) return;

    setSaving(true);
    try {
      const updated = await authApi.updateMe({
        fullName: fullName.trim(),
        email: trimmedEmail || null,
        address: address.trim() || null,
        locationCoordinates: locationCoords,
        avatarUrl,
      });
      setProfile(updated);
      navigation.goBack();
    } catch (error) {
      if (error instanceof ApiError && error.status === 409 && /email/i.test(error.message)) {
        setEmailServerError(error.message);
        return;
      }
      const message = error instanceof ApiError ? error.message : t('profile.saveError');
      Alert.alert(t('common.error'), message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.root}>
      <StatusBar style="light" />

      <AppTopBar
        left="back"
        variant="gold"
        title={t('profile.personalInformation')}
        onBackPress={navigation.goBack}
        style={styles.header}
      />

      <CurvedSheetScrollView keyboardShouldPersistTaps="handled">
        <AvatarPicker uri={avatarUrl} onChangeUrl={setAvatarUrl} />

        <FormInput label={t('profile.fullName')} value={fullName} onChangeText={setFullName} />
        <FormInput
          label={t('profile.email')}
          value={email}
          onChangeText={handleEmailChange}
          keyboardType="email-address"
          autoCapitalize="none"
          error={emailError ?? undefined}
        />
        <FormInput label={t('profile.phone')} value={profile?.phoneE164 ?? ''} editable={false} />
        <LocationField
          label={t('profile.address')}
          value={address}
          loading={locationLoading}
          onChangeText={setAddress}
          onUseCurrentLocation={() => void handleUseCurrentLocation()}
          onSelectOnMap={handleSelectOnMap}
        />

        <Button
          label={t('common.save')}
          onPress={() => void handleSave()}
          loading={saving}
          disabled={!hasChanges || saving || !!emailError || !isEmailFormatValid}
          style={styles.saveButton}
        />
      </CurvedSheetScrollView>

      {mapPickerSheet}
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
  saveButton: {
    marginTop: spacing.sm,
  },
});
