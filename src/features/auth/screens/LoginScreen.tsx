import React from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { i18n as appI18n } from '@/i18n';
import { OnboardingLayout } from '@/features/auth/components/OnboardingLayout';
import { FORGOT_MPIN_STEPS, LOGIN_STEPS } from '@/features/auth/constants/onboardingSteps';
import { authApi } from '@/features/auth/api/authApi';
import type { RootStackParamList } from '@/navigation/types';
import { useLanguage } from '@/i18n/hooks/useLanguage';
import { useAuthStore } from '@/store/authStore';
import { useDevicePrefsStore } from '@/store/devicePrefsStore';
import { useProfileStore } from '@/store/profileStore';
import { getDeviceId } from '@/shared/utils/deviceId';
import { ApiError } from '@/shared/services/api';
import { AppText } from '@/shared/components/AppText';
import { Button } from '@/shared/components/Button';
import { CodeInput } from '@/shared/components/CodeInput';
import { CountryPicker } from '@/shared/components/country-picker';
import { countryByIso2, defaultCountry, type Country } from '@/shared/constants/countries';
import { FormInput } from '@/shared/components/FormInput';
import { palette, spacing } from '@/shared/theme/tokens';
import { getFontFamily } from '@/shared/theme/typography';
import {
  formatPhoneDisplay,
  placeholderForDigitLength,
  sanitizePhoneDigits,
} from '@/features/auth/utils/phoneInput';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

const OTP_LENGTH = 6;
const RESEND_SECONDS = 30;
const MPIN_LENGTH = 4;

type LoginStep = 'phone' | 'otp' | 'mpin' | 'forgotOtp' | 'forgotNewMpin' | 'forgotConfirmMpin';

const STEP_ORDER: LoginStep[] = ['phone', 'otp', 'mpin'];
const FORGOT_STEP_ORDER: LoginStep[] = ['forgotOtp', 'forgotNewMpin', 'forgotConfirmMpin'];

const STEP_INDEX: Record<LoginStep, number> = {
  phone: 0,
  otp: 1,
  mpin: 2,
  forgotOtp: 0,
  forgotNewMpin: 1,
  forgotConfirmMpin: 2,
};

function errorMessage(error: unknown, fallback: string): string {
  if (error instanceof ApiError) return error.message;
  return fallback;
}

export function LoginScreen({ navigation }: Props): React.ReactElement {
  const { t } = useTranslation(undefined, { i18n: appI18n });
  const { currentLanguage } = useLanguage();
  const setAuthenticated = useAuthStore((s) => s.setAuthenticated);
  const setProfile = useProfileStore((s) => s.setProfile);
  const setLastPhone = useDevicePrefsStore((s) => s.setLastPhone);
  const clearLastPhone = useDevicePrefsStore((s) => s.clearLastPhone);
  const clearCachedMpin = useDevicePrefsStore((s) => s.clearCachedMpin);

  const lastPhone = useDevicePrefsStore.getState().lastPhone;
  const lastPhoneCountry = lastPhone ? countryByIso2(lastPhone.countryCode) : undefined;

  // A device that already completed a login/signup here jumps straight to the
  // MPIN step — no phone or OTP entry — matching stride-mobile's returning-device UX.
  const [step, setStep] = React.useState<LoginStep>(() =>
    lastPhone && lastPhoneCountry ? 'mpin' : 'phone',
  );
  const isReturningDeviceRef = React.useRef(step === 'mpin');
  const [country, setCountry] = React.useState<Country>(lastPhoneCountry ?? defaultCountry);
  const [phoneDigits, setPhoneDigits] = React.useState(lastPhone?.phoneDigits ?? '');
  const [otp, setOtp] = React.useState('');
  const [secondsLeft, setSecondsLeft] = React.useState(RESEND_SECONDS);
  const [mpin, setMpin] = React.useState('');
  const [newMpin, setNewMpin] = React.useState('');
  const [confirmNewMpin, setConfirmNewMpin] = React.useState('');
  const [submitting, setSubmitting] = React.useState(false);

  const phoneIdentity = {
    countryCallingCode: country.dialCode.replace(/^\+/, ''),
    phoneDigits: phoneDigits.trim(),
    countryCode: country.iso2,
  };
  const phone = `${country.dialCode}${phoneDigits.trim()}`;
  const isForgotFlow = FORGOT_STEP_ORDER.includes(step);

  const rememberPhone = () =>
    setLastPhone({
      countryCode: country.iso2,
      countryCallingCode: country.dialCode.replace(/^\+/, ''),
      phoneDigits: phoneDigits.trim(),
    });

  React.useEffect(() => {
    if ((step !== 'otp' && step !== 'forgotOtp') || secondsLeft <= 0) return;
    const timer = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [step, secondsLeft]);

  const goToStep = (next: LoginStep) => setStep(next);

  const goToPreviousStep = () => {
    // A returning device skipped straight to 'mpin' with no 'phone'/'otp' step
    // behind it in this session — back from there leaves the flow instead of
    // stepping into a step that was never actually visited.
    if (step === 'mpin' && isReturningDeviceRef.current) {
      navigation.goBack();
      return;
    }

    const order = isForgotFlow ? FORGOT_STEP_ORDER : STEP_ORDER;
    const index = order.indexOf(step);
    if (index > 0) {
      goToStep(order[index - 1]!);
      return;
    }
    if (isForgotFlow) {
      setMpin('');
      goToStep('mpin');
      return;
    }
    navigation.goBack();
  };

  const handleUseDifferentAccount = async () => {
    isReturningDeviceRef.current = false;
    setMpin('');
    setPhoneDigits('');
    setCountry(defaultCountry);
    await Promise.all([clearLastPhone(), clearCachedMpin()]);
    goToStep('phone');
  };

  const handleSendLoginOtp = async () => {
    setSubmitting(true);
    try {
      await authApi.sendLoginOtp(phoneIdentity, 'login');
      setOtp('');
      setSecondsLeft(RESEND_SECONDS);
      goToStep('otp');
    } catch (error) {
      Alert.alert(t('common.error'), errorMessage(error, t('loginPhone.sendFailed')));
    } finally {
      setSubmitting(false);
    }
  };

  const handleVerifyLoginOtp = async () => {
    setSubmitting(true);
    try {
      await authApi.verifyLoginOtp(phoneIdentity, otp, 'login');
      goToStep('mpin');
    } catch (error) {
      Alert.alert(t('common.error'), errorMessage(error, t('loginOtp.verifyFailed')));
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogIn = async () => {
    setSubmitting(true);
    try {
      const deviceId = await getDeviceId();
      const result = await authApi.loginWithMpin(phoneIdentity, mpin, deviceId);
      await setAuthenticated(result.accessToken);
      setProfile(result.profile);
      await rememberPhone();
      navigation.replace('Welcome');
    } catch (error) {
      setMpin('');

      // Edge case: this device expected to skip OTP (a saved phone existed) but
      // the server disagrees (e.g. app data was cleared without clearing this
      // device's session history server-side). Fall back to OTP-gated login
      // instead of leaving the user stuck on a failing MPIN screen.
      if (
        isReturningDeviceRef.current &&
        error instanceof ApiError &&
        error.code === 'VALIDATION_ERROR'
      ) {
        isReturningDeviceRef.current = false;
        await handleSendLoginOtp();
        return;
      }

      Alert.alert(t('common.error'), errorMessage(error, t('loginMpin.loginFailed')));
    } finally {
      setSubmitting(false);
    }
  };

  const handleStartForgotMpin = async () => {
    setSubmitting(true);
    try {
      await authApi.sendLoginOtp(phoneIdentity, 'mpin_reset');
      setOtp('');
      setSecondsLeft(RESEND_SECONDS);
      goToStep('forgotOtp');
    } catch (error) {
      Alert.alert(t('common.error'), errorMessage(error, t('loginPhone.sendFailed')));
    } finally {
      setSubmitting(false);
    }
  };

  const handleVerifyForgotOtp = async () => {
    setSubmitting(true);
    try {
      await authApi.verifyLoginOtp(phoneIdentity, otp, 'mpin_reset');
      goToStep('forgotNewMpin');
    } catch (error) {
      Alert.alert(t('common.error'), errorMessage(error, t('loginOtp.verifyFailed')));
    } finally {
      setSubmitting(false);
    }
  };

  const handleResetMpin = async () => {
    if (confirmNewMpin !== newMpin) {
      Alert.alert(t('signUpSecurity.mismatchTitle'), t('signUpSecurity.mismatchMessage'));
      setConfirmNewMpin('');
      return;
    }

    setSubmitting(true);
    try {
      const deviceId = await getDeviceId();
      const result = await authApi.resetMpin(phoneIdentity, newMpin, deviceId);
      await setAuthenticated(result.accessToken);
      setProfile(result.profile);
      await rememberPhone();
      navigation.replace('Welcome');
    } catch (error) {
      Alert.alert(t('common.error'), errorMessage(error, t('loginMpin.loginFailed')));
      setConfirmNewMpin('');
    } finally {
      setSubmitting(false);
    }
  };

  const handleResend = async () => {
    setSubmitting(true);
    try {
      await authApi.sendLoginOtp(phoneIdentity, step === 'forgotOtp' ? 'mpin_reset' : 'login');
      setSecondsLeft(RESEND_SECONDS);
    } catch (error) {
      Alert.alert(t('common.error'), errorMessage(error, t('loginPhone.sendFailed')));
    } finally {
      setSubmitting(false);
    }
  };

  const isPhoneValid = phoneDigits.trim().length === country.phoneDigitLength;
  const isOtpValid = otp.length === OTP_LENGTH;
  const isMpinValid = mpin.length === MPIN_LENGTH;
  const isNewMpinValid = newMpin.length === MPIN_LENGTH;
  const isConfirmMpinValid = confirmNewMpin.length === MPIN_LENGTH;

  const header =
    step === 'phone'
      ? { title: t('loginPhone.title'), subtitle: t('loginPhone.subtitle') }
      : step === 'otp' || step === 'forgotOtp'
        ? {
            title: t('loginOtp.title'),
            subtitle: t('loginOtp.subtitleTemplate', { length: OTP_LENGTH, phone }),
          }
        : step === 'mpin'
          ? {
              title: t('loginMpin.title'),
              subtitle: t('loginMpin.subtitleTemplate', { length: MPIN_LENGTH }),
            }
          : step === 'forgotNewMpin'
            ? {
                title: t('signUpSecurity.createLabel'),
                subtitle: t('signUpSecurity.subtitleTemplate', { length: MPIN_LENGTH }),
              }
            : {
                title: t('signUpSecurity.confirmLabel'),
                subtitle: t('signUpSecurity.subtitleTemplate', { length: MPIN_LENGTH }),
              };

  const canContinue =
    step === 'phone'
      ? isPhoneValid
      : step === 'otp' || step === 'forgotOtp'
        ? isOtpValid
        : step === 'mpin'
          ? isMpinValid
          : step === 'forgotNewMpin'
            ? isNewMpinValid
            : isConfirmMpinValid;

  const continueLabel =
    step === 'phone'
      ? t('loginPhone.sendCode')
      : step === 'otp' || step === 'forgotOtp'
        ? t('loginOtp.verify')
        : step === 'mpin'
          ? t('loginMpin.logIn')
          : step === 'forgotNewMpin'
            ? t('common.continue')
            : t('signUpSecurity.finish');

  const handleContinue = () => {
    if (submitting) return;

    if (step === 'phone') {
      void handleSendLoginOtp();
    } else if (step === 'otp') {
      void handleVerifyLoginOtp();
    } else if (step === 'mpin') {
      void handleLogIn();
    } else if (step === 'forgotOtp') {
      void handleVerifyForgotOtp();
    } else if (step === 'forgotNewMpin') {
      goToStep('forgotConfirmMpin');
    } else {
      void handleResetMpin();
    }
  };

  return (
    <OnboardingLayout
      steps={isForgotFlow ? FORGOT_MPIN_STEPS : LOGIN_STEPS}
      currentStep={STEP_INDEX[step]}
      title={header.title}
      subtitle={header.subtitle}
      onBack={goToPreviousStep}
      canContinue={canContinue && !submitting}
      continueLabel={continueLabel}
      onContinue={handleContinue}
    >
      {step === 'phone' ? (
        <View style={styles.form}>
          <FormInput
            label={t('loginPhone.label')}
            placeholder={placeholderForDigitLength(country.phoneDigitLength)}
            keyboardType="phone-pad"
            autoFocus
            value={formatPhoneDisplay(phoneDigits)}
            onChangeText={(text) =>
              setPhoneDigits(sanitizePhoneDigits(text, country.phoneDigitLength))
            }
            leftAdornment={<CountryPicker value={country} onChange={setCountry} />}
            style={[styles.phoneInput, { fontFamily: getFontFamily(currentLanguage, 'regular') }]}
          />
        </View>
      ) : null}

      {step === 'otp' || step === 'forgotOtp' ? (
        <View style={styles.form}>
          <CodeInput length={OTP_LENGTH} value={otp} onChangeValue={setOtp} />

          <View style={styles.resendRow}>
            {secondsLeft > 0 ? (
              <AppText style={styles.resendMuted}>
                {t('loginOtp.resendIn', { seconds: secondsLeft })}
              </AppText>
            ) : (
              <Button
                label={t('loginOtp.resend')}
                variant="link"
                onPress={() => void handleResend()}
              />
            )}
          </View>
        </View>
      ) : null}

      {step === 'mpin' ? (
        <View style={styles.form}>
          {isReturningDeviceRef.current ? (
            <AppText style={styles.returningPhone}>{phone}</AppText>
          ) : null}
          <CodeInput length={MPIN_LENGTH} value={mpin} onChangeValue={setMpin} secure autoFocus />
          <Button
            label={t('loginMpin.forgotMpin')}
            variant="link"
            style={styles.forgotButton}
            onPress={() => void handleStartForgotMpin()}
          />
          {isReturningDeviceRef.current ? (
            <Button
              label={t('loginMpin.useDifferentAccount')}
              variant="link"
              style={styles.forgotButton}
              onPress={() => void handleUseDifferentAccount()}
            />
          ) : null}
        </View>
      ) : null}

      {step === 'forgotNewMpin' ? (
        <View style={styles.form}>
          <CodeInput
            length={MPIN_LENGTH}
            value={newMpin}
            onChangeValue={setNewMpin}
            secure
            autoFocus
          />
        </View>
      ) : null}

      {step === 'forgotConfirmMpin' ? (
        <View style={styles.form}>
          <CodeInput
            length={MPIN_LENGTH}
            value={confirmNewMpin}
            onChangeValue={setConfirmNewMpin}
            secure
            autoFocus
          />
        </View>
      ) : null}

      {step === 'phone' ? (
        <View style={styles.footer}>
          <AppText style={styles.footerText}>{t('login.noAccount')}</AppText>
          <Button
            label={t('login.signUp')}
            variant="link"
            style={styles.footerButton}
            onPress={() => navigation.navigate('SignUpFlow')}
          />
        </View>
      ) : null}
    </OnboardingLayout>
  );
}

const styles = StyleSheet.create({
  form: {
    gap: spacing.md,
  },
  phoneInput: {
    paddingVertical: spacing.md,
    fontSize: 16,
  },
  resendRow: {
    alignItems: 'center',
  },
  resendMuted: {
    fontSize: 13,
    color: palette.muted,
  },
  forgotButton: {
    alignSelf: 'center',
  },
  returningPhone: {
    fontSize: 14,
    color: palette.muted,
    textAlign: 'center',
  },
  footer: {
    flexDirection: 'row',
    flexWrap: 'nowrap',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    marginTop: spacing.xl,
  },
  footerText: {
    fontSize: 14,
    color: palette.muted,
  },
  footerButton: {
    flexShrink: 0,
  },
});
