import React from 'react';
import { StyleSheet, View } from 'react-native';
import { confirmBiometric } from '@/shared/utils/confirmBiometric';
import { showAppAlert } from '@/shared/services/appAlert';
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
import { GoldSheetScreen } from '@/features/dashboard/components/GoldSheetScreen';
import { AppText } from '@/shared/components/AppText';
import { Button } from '@/shared/components/Button';
import { CodeInput } from '@/shared/components/CodeInput';
import { BiometricToggleRow } from '@/shared/components/BiometricToggleRow';
import { palette, radius, spacing } from '@/theme';

type Props = NativeStackScreenProps<RootStackParamList, 'SecuritySettings'>;

type MpinChangeStep = 'idle' | 'otp' | 'newMpin' | 'enableMpin';

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
  const cachedMpin = useDevicePrefsStore((state) => state.cachedMpin);
  const setDeviceBiometricEnabled = useDevicePrefsStore((state) => state.setBiometricEnabled);
  const setCachedMpin = useDevicePrefsStore((state) => state.setCachedMpin);
  const clearCachedMpin = useDevicePrefsStore((state) => state.clearCachedMpin);
  const { available: biometricAvailable, kind: biometricKind } = useDeviceBiometric();

  const [step, setStep] = React.useState<MpinChangeStep>('idle');
  const [enableMpin, setEnableMpin] = React.useState('');
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

  const promptingRef = React.useRef(false);

  const persistBiometric = async (enabled: boolean, mpin?: string) => {
    await setDeviceBiometricEnabled(enabled);
    if (enabled && mpin) await setCachedMpin(mpin);
    if (!enabled) await clearCachedMpin();
    try {
      const updated = await authApi.updateMe({ biometricEnabled: enabled });
      setProfile(updated);
    } catch {
      // Face ID is a device setting. A profile sync failure should not undo it.
    }
  };

  const handleToggleBiometric = async (enabled: boolean) => {
    if (promptingRef.current) return;
    if (!enabled) {
      try {
        await persistBiometric(false);
        setStep('idle');
      } catch {
        showAppAlert(t('common.error'), t('securitySettings.biometricToggleFailed'));
      }
      return;
    }

    promptingRef.current = true;
    await setDeviceBiometricEnabled(true);
    const result = await confirmBiometric(t('signUpSecurity.biometricPrompt'), t('common.cancel'));
    promptingRef.current = false;

    if (!result.success) {
      await setDeviceBiometricEnabled(false);
      if (
        result.error !== 'user_cancel' &&
        result.error !== 'system_cancel' &&
        result.error !== 'app_cancel'
      ) {
        showAppAlert(t('common.error'), t('securitySettings.biometricToggleFailed'));
      }
      return;
    }

    if (cachedMpin) {
      try {
        await persistBiometric(true, cachedMpin);
      } catch {
        showAppAlert(t('common.error'), t('securitySettings.biometricToggleFailed'));
      }
      return;
    }

    setEnableMpin('');
    setStep('enableMpin');
  };

  const handleConfirmEnableMpin = async () => {
    if (!phoneIdentity || enableMpin.length !== MPIN_LENGTH) return;
    setSubmitting(true);
    try {
      const deviceId = await getDeviceId();
      const result = await authApi.loginWithMpin(phoneIdentity, enableMpin, deviceId);
      await setAuthenticated(result.accessToken, result.refreshToken);
      setProfile(result.profile);
      await persistBiometric(true, enableMpin);
      setStep('idle');
      setEnableMpin('');
    } catch (error) {
      showAppAlert(t('common.error'), errorMessage(error, t('loginMpin.loginFailed')));
      setEnableMpin('');
    } finally {
      setSubmitting(false);
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
      showAppAlert(t('common.error'), errorMessage(error, t('loginPhone.sendFailed')));
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
      showAppAlert(t('common.error'), errorMessage(error, t('loginPhone.sendFailed')));
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
      showAppAlert(t('common.error'), errorMessage(error, t('loginOtp.verifyFailed')));
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveMpin = async () => {
    if (!phoneIdentity) return;
    if (confirmMpin !== newMpin) {
      showAppAlert(t('signUpSecurity.mismatchTitle'), t('signUpSecurity.mismatchMessage'));
      setConfirmMpin('');
      return;
    }

    setSubmitting(true);
    try {
      const deviceId = await getDeviceId();
      const result = await authApi.resetMpin(phoneIdentity, newMpin, deviceId);
      await setAuthenticated(result.accessToken, result.refreshToken);
      setProfile(result.profile);
      const keepBiometric =
        result.profile.biometricEnabled || useDevicePrefsStore.getState().biometricEnabled;
      if (keepBiometric) await setCachedMpin(newMpin);
      else await clearCachedMpin();
      await setDeviceBiometricEnabled(keepBiometric);
      resetMpinFlow();
      showAppAlert(t('securitySettings.mpinSavedTitle'), t('securitySettings.mpinSavedMessage'));
    } catch (error) {
      showAppAlert(t('common.error'), errorMessage(error, t('securitySettings.mpinSaveFailed')));
      setConfirmMpin('');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <GoldSheetScreen
      left="back"
      title={t('securitySettings.title')}
      onBackPress={navigation.goBack}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.menuCard}>
        <BiometricToggleRow
          enabled={biometricEnabled}
          onToggle={(enabled) => void handleToggleBiometric(enabled)}
          available={biometricAvailable}
          kind={biometricKind}
          title={t(
            biometricKind === 'fingerprint'
              ? 'securitySettings.biometricTitleFingerprint'
              : 'securitySettings.biometricTitle',
          )}
          subtitle={t(
            biometricKind === 'fingerprint'
              ? 'securitySettings.biometricSubtitleFingerprint'
              : 'securitySettings.biometricSubtitle',
          )}
        />
        {step === 'enableMpin' ? (
          <View style={styles.enableMpin}>
            <AppText style={styles.changeMpinSubtitle}>{t('loginMpin.title')}</AppText>
            <CodeInput
              length={MPIN_LENGTH}
              value={enableMpin}
              onChangeValue={setEnableMpin}
              secure
              autoFocus
            />
            <Button
              label={t('common.confirm')}
              disabled={enableMpin.length !== MPIN_LENGTH}
              loading={submitting}
              onPress={() => void handleConfirmEnableMpin()}
            />
          </View>
        ) : null}
      </View>

      <View style={styles.card}>
        {step === 'idle' || step === 'enableMpin' ? (
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
    </GoldSheetScreen>
  );
}

const styles = StyleSheet.create({
  menuCard: {
    backgroundColor: palette.warmWhite,
    borderRadius: radius.lg,
    overflow: 'hidden',
  },
  enableMpin: {
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
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
