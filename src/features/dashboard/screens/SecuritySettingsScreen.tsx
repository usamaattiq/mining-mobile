import React from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { i18n as appI18n } from '@/i18n';
import type { RootStackParamList } from '@/navigation/types';
import { authApi } from '@/features/auth/api/authApi';
import { useAuthStore } from '@/store/authStore';
import { useDevicePrefsStore } from '@/store/devicePrefsStore';
import { useProfileStore } from '@/store/profileStore';
import { useDeviceBiometric } from '@/shared/hooks/useDeviceBiometric';
import { getDeviceId } from '@/shared/utils/deviceId';
import { ApiError } from '@/shared/services/api';
import { AppTopBar } from '@/shared/components/AppTopBar';
import { AppText } from '@/shared/components/AppText';
import { Button } from '@/shared/components/Button';
import { CodeInput } from '@/shared/components/CodeInput';
import { BiometricToggleRow } from '@/shared/components/BiometricToggleRow';
import { CurvedSheetScrollView } from '@/features/dashboard/components/CurvedSheetScrollView';
import { palette, radius, spacing } from '@/theme';

type Props = NativeStackScreenProps<RootStackParamList, 'SecuritySettings'>;

type MpinChangeStep = 'idle' | 'otp' | 'newMpin';

const OTP_LENGTH = 6;
const MPIN_LENGTH = 4;
const RESEND_SECONDS = 30;

function errorMessage(error: unknown, fallback: string): string {
  if (error instanceof ApiError) return error.message;
  return fallback;
}

export function SecuritySettingsScreen({ navigation }: Props): React.ReactElement {
  const { t } = useTranslation(undefined, { i18n: appI18n });
  const profile = useProfileStore((state) => state.profile);
  const setProfile = useProfileStore((state) => state.setProfile);
  const setAuthenticated = useAuthStore((state) => state.setAuthenticated);
  const biometricEnabled = useDevicePrefsStore((state) => state.biometricEnabled);
  const setDeviceBiometricEnabled = useDevicePrefsStore((state) => state.setBiometricEnabled);
  const setCachedMpin = useDevicePrefsStore((state) => state.setCachedMpin);
  const clearCachedMpin = useDevicePrefsStore((state) => state.clearCachedMpin);
  const { available: biometricAvailable, kind: biometricKind } = useDeviceBiometric();

  const [step, setStep] = React.useState<MpinChangeStep>('idle');
  const [otp, setOtp] = React.useState('');
  const [newMpin, setNewMpin] = React.useState('');
  const [confirmMpin, setConfirmMpin] = React.useState('');
  const [secondsLeft, setSecondsLeft] = React.useState(RESEND_SECONDS);
  const [submitting, setSubmitting] = React.useState(false);

  React.useEffect(() => {
    if (step !== 'otp' || secondsLeft <= 0) return;
    const timer = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [step, secondsLeft]);

  const phoneIdentity = React.useMemo(() => {
    if (!profile) return null;
    const callingCode = profile.countryCallingCode.replace(/^\+/, '');
    const phoneDigits = profile.phoneE164.startsWith(`+${callingCode}`)
      ? profile.phoneE164.slice(callingCode.length + 1)
      : profile.phoneE164.replace(/^\+/, '');
    return { countryCallingCode: callingCode, phoneDigits, countryCode: profile.countryCode };
  }, [profile]);

  const resetMpinFlow = () => {
    setStep('idle');
    setOtp('');
    setNewMpin('');
    setConfirmMpin('');
  };

  const handleToggleBiometric = async (enabled: boolean) => {
    try {
      await setDeviceBiometricEnabled(enabled);
      if (!enabled) await clearCachedMpin();
    } catch {
      Alert.alert(t('common.error'), t('securitySettings.biometricToggleFailed'));
    }
  };

  const handleStartChangeMpin = async () => {
    if (!phoneIdentity) return;
    setSubmitting(true);
    try {
      await authApi.sendLoginOtp(phoneIdentity, 'mpin_reset');
      setOtp('');
      setSecondsLeft(RESEND_SECONDS);
      setStep('otp');
    } catch (error) {
      Alert.alert(t('common.error'), errorMessage(error, t('loginPhone.sendFailed')));
    } finally {
      setSubmitting(false);
    }
  };

  const handleResendOtp = async () => {
    if (!phoneIdentity) return;
    setSubmitting(true);
    try {
      await authApi.sendLoginOtp(phoneIdentity, 'mpin_reset');
      setSecondsLeft(RESEND_SECONDS);
    } catch (error) {
      Alert.alert(t('common.error'), errorMessage(error, t('loginPhone.sendFailed')));
    } finally {
      setSubmitting(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!phoneIdentity) return;
    setSubmitting(true);
    try {
      await authApi.verifyLoginOtp(phoneIdentity, otp, 'mpin_reset');
      setStep('newMpin');
    } catch (error) {
      Alert.alert(t('common.error'), errorMessage(error, t('loginOtp.verifyFailed')));
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveMpin = async () => {
    if (!phoneIdentity) return;
    if (confirmMpin !== newMpin) {
      Alert.alert(t('signUpSecurity.mismatchTitle'), t('signUpSecurity.mismatchMessage'));
      setConfirmMpin('');
      return;
    }

    setSubmitting(true);
    try {
      const deviceId = await getDeviceId();
      const result = await authApi.resetMpin(phoneIdentity, newMpin, deviceId);
      await setAuthenticated(result.accessToken);
      setProfile(result.profile);
      if (result.profile.biometricEnabled) {
        await setCachedMpin(newMpin);
      } else {
        await clearCachedMpin();
      }
      await setDeviceBiometricEnabled(result.profile.biometricEnabled);
      resetMpinFlow();
      Alert.alert(t('securitySettings.mpinSavedTitle'), t('securitySettings.mpinSavedMessage'));
    } catch (error) {
      Alert.alert(t('common.error'), errorMessage(error, t('securitySettings.mpinSaveFailed')));
      setConfirmMpin('');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.root}>
      <StatusBar style="light" />

      <AppTopBar
        left="back"
        variant="gold"
        title={t('securitySettings.title')}
        onBackPress={navigation.goBack}
        style={styles.header}
      />

      <CurvedSheetScrollView keyboardShouldPersistTaps="handled">
        <View style={styles.menuCard}>
          <BiometricToggleRow
            enabled={biometricEnabled}
            onToggle={(enabled) => void handleToggleBiometric(enabled)}
            available={biometricAvailable}
            kind={biometricKind}
            title={t('securitySettings.biometricTitle')}
            subtitle={t('securitySettings.biometricSubtitle')}
          />
        </View>

        <View style={styles.card}>
          {step === 'idle' ? (
            <View style={styles.changeMpinRow}>
              <View style={styles.changeMpinCopy}>
                <AppText weight="semibold" style={styles.changeMpinTitle}>
                  {t('securitySettings.mpinTitle')}
                </AppText>
                <AppText style={styles.changeMpinSubtitle}>
                  {t('securitySettings.mpinSubtitle')}
                </AppText>
              </View>
              <Button
                label={t('securitySettings.changeMpin')}
                variant="outline"
                onPress={() => void handleStartChangeMpin()}
                loading={submitting}
                disabled={!phoneIdentity}
              />
            </View>
          ) : step === 'otp' ? (
            <View style={styles.stepGap}>
              <AppText weight="bold" style={styles.stepTitle}>
                {t('loginOtp.title')}
              </AppText>
              <AppText style={styles.stepSubtitle}>
                {t('loginOtp.subtitleTemplate', {
                  length: OTP_LENGTH,
                  phone: `${profile?.countryCallingCode}${phoneIdentity?.phoneDigits ?? ''}`,
                })}
              </AppText>
              <CodeInput length={OTP_LENGTH} value={otp} onChangeValue={setOtp} />
              <Button
                label={
                  secondsLeft > 0
                    ? t('loginOtp.resendIn', { seconds: secondsLeft })
                    : t('loginOtp.resend')
                }
                variant="link"
                onPress={() => void handleResendOtp()}
                disabled={secondsLeft > 0 || submitting}
              />
              <View style={styles.stepActionsRow}>
                <Button label={t('common.cancel')} variant="outline" onPress={resetMpinFlow} />
                <Button
                  label={t('loginOtp.verify')}
                  onPress={() => void handleVerifyOtp()}
                  loading={submitting}
                  disabled={otp.length !== OTP_LENGTH}
                  style={styles.stepPrimaryAction}
                />
              </View>
            </View>
          ) : (
            <View style={styles.stepGap}>
              <AppText weight="bold" style={styles.stepTitle}>
                {t('securitySettings.newMpinTitle')}
              </AppText>
              <AppText style={styles.fieldLabel}>{t('signUpSecurity.createLabel')}</AppText>
              <CodeInput length={MPIN_LENGTH} value={newMpin} onChangeValue={setNewMpin} secure />
              <AppText style={styles.fieldLabel}>{t('signUpSecurity.confirmLabel')}</AppText>
              <CodeInput
                length={MPIN_LENGTH}
                value={confirmMpin}
                onChangeValue={setConfirmMpin}
                secure
                autoFocus={false}
              />
              <View style={styles.stepActionsRow}>
                <Button label={t('common.cancel')} variant="outline" onPress={resetMpinFlow} />
                <Button
                  label={t('common.save')}
                  onPress={() => void handleSaveMpin()}
                  loading={submitting}
                  disabled={newMpin.length !== MPIN_LENGTH || confirmMpin.length !== MPIN_LENGTH}
                  style={styles.stepPrimaryAction}
                />
              </View>
            </View>
          )}
        </View>
      </CurvedSheetScrollView>
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
  menuCard: {
    backgroundColor: palette.warmWhite,
    borderRadius: radius.lg,
    overflow: 'hidden',
  },
  card: {
    backgroundColor: palette.warmWhite,
    borderRadius: radius.lg,
    padding: spacing.lg,
  },
  changeMpinRow: {
    gap: spacing.md,
  },
  changeMpinCopy: {
    gap: 2,
  },
  changeMpinTitle: {
    fontSize: 15,
    color: palette.charcoal,
  },
  changeMpinSubtitle: {
    fontSize: 12,
    lineHeight: 16,
    color: palette.muted,
  },
  stepGap: {
    gap: spacing.sm,
  },
  stepTitle: {
    fontSize: 17,
    color: palette.charcoal,
  },
  stepSubtitle: {
    fontSize: 13,
    color: palette.muted,
  },
  fieldLabel: {
    fontSize: 13,
    color: palette.charcoal,
    marginTop: spacing.xs,
  },
  stepActionsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  stepPrimaryAction: {
    flex: 1,
  },
});
