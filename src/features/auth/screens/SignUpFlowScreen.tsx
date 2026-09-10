import React from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import * as LocalAuthentication from 'expo-local-authentication';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { i18n as appI18n } from '@/i18n';
import { OnboardingLayout } from '@/features/auth/components/OnboardingLayout';
import { SIGN_UP_STEPS } from '@/features/auth/constants/onboardingSteps';
import { authApi } from '@/features/auth/api/authApi';
import { useLocationMapPicker } from '@/features/auth/hooks/useLocationMapPicker';
import { SignupLocationField } from '@/features/auth/components/SignupLocationField';
import { AvatarPicker } from '@/shared/components/AvatarPicker';
import { uploadMedia, type UploadableContentType } from '@/shared/services/media';
import {
  formatPhoneDisplay,
  placeholderForDigitLength,
  sanitizePhoneDigits,
} from '@/features/auth/utils/phoneInput';
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
import { defaultCountry, type Country } from '@/shared/constants/countries';
import { FormInput } from '@/shared/components/FormInput';
import { palette, radius, spacing } from '@/theme';
import { getFontFamily } from '@/theme';

function errorMessage(error: unknown, fallback: string): string {
  if (error instanceof ApiError) return error.message;
  return fallback;
}

type Props = NativeStackScreenProps<RootStackParamList, 'SignUpFlow'>;

const OTP_LENGTH = 6;
const RESEND_SECONDS = 30;
const MPIN_LENGTH = 4;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type SignUpStep = 'phone' | 'otp' | 'personal' | 'security';

const STEP_ORDER: SignUpStep[] = ['phone', 'otp', 'personal', 'security'];

const STEP_INDEX: Record<SignUpStep, number> = {
  phone: 0,
  otp: 1,
  personal: 2,
  security: 3,
};

type AccountType = 'individual' | 'company';

/**
 * One persistent OnboardingLayout; only step content swaps (avoids remount jerk).
 */
export function SignUpFlowScreen({ navigation }: Props): React.ReactElement {
  const { t } = useTranslation(undefined, { i18n: appI18n });
  const { currentLanguage } = useLanguage();
  const setAuthenticated = useAuthStore((s) => s.setAuthenticated);
  const setProfile = useProfileStore((s) => s.setProfile);
  const setLastPhone = useDevicePrefsStore((s) => s.setLastPhone);
  const setCachedMpin = useDevicePrefsStore((s) => s.setCachedMpin);
  const setDeviceBiometricEnabled = useDevicePrefsStore((s) => s.setBiometricEnabled);

  const [step, setStep] = React.useState<SignUpStep>('phone');
  const [country, setCountry] = React.useState<Country>(defaultCountry);
  const [phoneDigits, setPhoneDigits] = React.useState('');
  const [phoneError, setPhoneError] = React.useState<string | null>(null);
  const [otp, setOtp] = React.useState('');
  const [secondsLeft, setSecondsLeft] = React.useState(RESEND_SECONDS);
  const [accountType, setAccountType] = React.useState<AccountType>('individual');
  const [avatarAsset, setAvatarAsset] = React.useState<{
    uri: string;
    contentType: UploadableContentType;
  } | null>(null);
  const [fullName, setFullName] = React.useState('');
  const [companyName, setCompanyName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [emailError, setEmailError] = React.useState<string | null>(null);
  const [checkingEmail, setCheckingEmail] = React.useState(false);
  const [location, setLocation] = React.useState('');
  const [locationCoords, setLocationCoords] = React.useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [mpin, setMpin] = React.useState('');
  const [confirmMpin, setConfirmMpin] = React.useState('');
  const [biometricAvailable, setBiometricAvailable] = React.useState(false);
  const [biometricEnabled, setBiometricEnabled] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);
  const { locationLoading, getCurrentLocation, openMapPickerForSelection, mapPickerSheet } =
    useLocationMapPicker();

  const phoneIdentity = {
    countryCallingCode: country.dialCode.replace(/^\+/, ''),
    phoneDigits: phoneDigits.trim(),
    countryCode: country.iso2,
  };
  const phone = `${country.dialCode}${phoneDigits.trim()}`;

  React.useEffect(() => {
    if (step !== 'otp' || secondsLeft <= 0) return;
    const timer = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [step, secondsLeft]);

  React.useEffect(() => {
    if (step !== 'personal') return;
    const trimmed = email.trim();
    if (trimmed.length === 0 || !EMAIL_REGEX.test(trimmed)) {
      setEmailError(null);
      setCheckingEmail(false);
      return;
    }

    setCheckingEmail(true);
    let cancelled = false;
    const timer = setTimeout(() => {
      authApi
        .checkSignupEmailAvailable(trimmed)
        .then(({ available }) => {
          if (cancelled) return;
          setEmailError(available ? null : t('signUpPersonalInfo.emailAlreadyExists'));
        })
        .catch(() => {
          if (!cancelled) setEmailError(null);
        })
        .finally(() => {
          if (!cancelled) setCheckingEmail(false);
        });
    }, 500);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [step, email, t]);

  React.useEffect(() => {
    if (step !== 'security') return;
    (async () => {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      setBiometricAvailable(hasHardware && isEnrolled);
    })();
  }, [step]);

  const goToStep = (next: SignUpStep) => setStep(next);

  const goToPreviousStep = () => {
    const index = STEP_ORDER.indexOf(step);
    if (index > 0) {
      goToStep(STEP_ORDER[index - 1]!);
      return;
    }
    navigation.goBack();
  };

  const handleUseCurrentLocation = async () => {
    const selection = await getCurrentLocation();
    if (!selection) {
      Alert.alert(t('common.error'), t('signUpPersonalInfo.locationFailed'));
      return;
    }
    setLocation(selection.label);
    setLocationCoords({ latitude: selection.latitude, longitude: selection.longitude });
  };

  const handleSelectOnMap = () => {
    openMapPickerForSelection((selection) => {
      setLocation(selection.label);
      setLocationCoords({ latitude: selection.latitude, longitude: selection.longitude });
    }, locationCoords);
  };

  const handleEnableBiometric = async () => {
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: t('signUpSecurity.biometricPrompt'),
    });
    if (result.success) {
      setBiometricEnabled(true);
    }
  };

  const handleSendSignupOtp = async () => {
    setSubmitting(true);
    setPhoneError(null);
    try {
      await authApi.sendSignupOtp(phoneIdentity);
      setOtp('');
      setSecondsLeft(RESEND_SECONDS);
      goToStep('otp');
    } catch (error) {
      setPhoneError(errorMessage(error, t('signUpPhone.sendFailed')));
    } finally {
      setSubmitting(false);
    }
  };

  const handleVerifySignupOtp = async () => {
    setSubmitting(true);
    try {
      await authApi.verifySignupOtp(phoneIdentity, otp);
      goToStep('personal');
    } catch (error) {
      Alert.alert(t('common.error'), errorMessage(error, t('signUpOtp.verifyFailed')));
    } finally {
      setSubmitting(false);
    }
  };

  const handleResendSignupOtp = async () => {
    setSubmitting(true);
    try {
      await authApi.sendSignupOtp(phoneIdentity);
      setSecondsLeft(RESEND_SECONDS);
    } catch (error) {
      Alert.alert(t('common.error'), errorMessage(error, t('signUpPhone.sendFailed')));
    } finally {
      setSubmitting(false);
    }
  };

  const handleSecurityContinue = async () => {
    if (confirmMpin !== mpin) {
      Alert.alert(t('signUpSecurity.mismatchTitle'), t('signUpSecurity.mismatchMessage'));
      setConfirmMpin('');
      return;
    }

    setSubmitting(true);
    try {
      const deviceId = await getDeviceId();
      const result = await authApi.submitSignup({
        ...phoneIdentity,
        fullName: fullName.trim(),
        accountType,
        companyName: accountType === 'company' ? companyName.trim() : undefined,
        email: email.trim() || undefined,
        address: location.trim() || undefined,
        locationCoordinates: locationCoords,
        mpin,
        biometricEnabled,
        deviceId,
      });
      await setAuthenticated(result.accessToken);
      setProfile(result.profile);

      if (avatarAsset) {
        try {
          const { key } = await uploadMedia(avatarAsset);
          const updatedProfile = await authApi.updateMe({ avatarUrl: key });
          setProfile(updatedProfile);
        } catch {
          // Avatar upload failing shouldn't block account creation; user can retry from profile.
        }
      }

      await setLastPhone({
        countryCode: country.iso2,
        countryCallingCode: country.dialCode.replace(/^\+/, ''),
        phoneDigits: phoneDigits.trim(),
      });
      if (biometricEnabled) {
        await setCachedMpin(mpin);
      }
      await setDeviceBiometricEnabled(biometricEnabled);
      navigation.replace('Welcome');
    } catch (error) {
      if (error instanceof ApiError && error.status === 409 && /email/i.test(error.message)) {
        setEmailError(t('signUpPersonalInfo.emailAlreadyExists'));
        goToStep('personal');
        return;
      }
      Alert.alert(t('common.error'), errorMessage(error, t('signUpSecurity.mismatchMessage')));
    } finally {
      setSubmitting(false);
    }
  };

  const isPhoneValid = phoneDigits.trim().length === country.phoneDigitLength;
  const isOtpValid = otp.length === OTP_LENGTH;
  const isPersonalValid =
    fullName.trim().length > 1 &&
    (accountType === 'individual' || companyName.trim().length > 1) &&
    location.trim().length > 1 &&
    (email.trim().length === 0 || EMAIL_REGEX.test(email.trim())) &&
    !emailError &&
    !checkingEmail;
  const isMpinComplete = mpin.length === MPIN_LENGTH && confirmMpin.length === MPIN_LENGTH;

  const header =
    step === 'phone'
      ? { title: t('signUpPhone.title'), subtitle: t('signUpPhone.subtitle') }
      : step === 'otp'
        ? {
            title: t('signUpOtp.title'),
            subtitle: t('signUpOtp.subtitleTemplate', { length: OTP_LENGTH, phone }),
          }
        : step === 'personal'
          ? { title: t('signUpPersonalInfo.title'), subtitle: t('signUpPersonalInfo.subtitle') }
          : {
              title: t('signUpSecurity.title'),
              subtitle: t('signUpSecurity.subtitleTemplate', { length: MPIN_LENGTH }),
            };

  return (
    <OnboardingLayout
      steps={SIGN_UP_STEPS}
      currentStep={STEP_INDEX[step]}
      title={header.title}
      subtitle={header.subtitle}
      onBack={step === 'phone' || step === 'otp' ? goToPreviousStep : undefined}
      canContinue={
        (step === 'phone'
          ? isPhoneValid
          : step === 'otp'
            ? isOtpValid
            : step === 'personal'
              ? isPersonalValid
              : isMpinComplete) && !submitting
      }
      continueLabel={
        step === 'phone'
          ? t('signUpPhone.sendCode')
          : step === 'otp'
            ? t('signUpOtp.verify')
            : step === 'personal'
              ? t('common.continue')
              : t('signUpSecurity.finish')
      }
      onContinue={() => {
        if (submitting) return;
        if (step === 'phone') {
          void handleSendSignupOtp();
        } else if (step === 'otp') {
          void handleVerifySignupOtp();
        } else if (step === 'personal') {
          goToStep('security');
        } else if (step === 'security') {
          void handleSecurityContinue();
        }
      }}
    >
      {step === 'phone' ? (
        <View style={styles.form}>
          <FormInput
            label={t('signUpPhone.label')}
            required
            error={phoneError ?? undefined}
            placeholder={placeholderForDigitLength(country.phoneDigitLength)}
            keyboardType="phone-pad"
            autoFocus
            value={formatPhoneDisplay(phoneDigits)}
            onChangeText={(text) => {
              setPhoneDigits(sanitizePhoneDigits(text, country.phoneDigitLength));
              setPhoneError(null);
            }}
            leftAdornment={
              <CountryPicker
                value={country}
                onChange={(next) => {
                  setCountry(next);
                  setPhoneError(null);
                }}
              />
            }
            style={[styles.phoneInput, { fontFamily: getFontFamily(currentLanguage, 'regular') }]}
          />
        </View>
      ) : null}

      {step === 'otp' ? (
        <View style={styles.form}>
          <CodeInput length={OTP_LENGTH} value={otp} onChangeValue={setOtp} />

          <View style={styles.resendRow}>
            {secondsLeft > 0 ? (
              <AppText style={styles.resendMuted}>
                {t('signUpOtp.resendIn', { seconds: secondsLeft })}
              </AppText>
            ) : (
              <Button
                label={t('signUpOtp.resend')}
                variant="link"
                onPress={() => void handleResendSignupOtp()}
              />
            )}
          </View>
        </View>
      ) : null}

      {step === 'personal' ? (
        <View style={styles.form}>
          <View style={styles.accountTypeRow}>
            {(['individual', 'company'] as AccountType[]).map((type) => (
              <Button
                key={type}
                label={t(`signUpPersonalInfo.${type}`)}
                variant={accountType === type ? 'primary' : 'outline'}
                style={[
                  styles.accountTypeOption,
                  accountType !== type && styles.accountTypeOptionInactive,
                ]}
                onPress={() => setAccountType(type)}
              />
            ))}
          </View>

          <AvatarPicker
            label={t('signUpPersonalInfo.profileImage')}
            uri={null}
            onChangeKey={() => {}}
            deferUpload
            onPickLocal={setAvatarAsset}
          />

          <FormInput
            label={t('signUpPersonalInfo.fullName')}
            required
            placeholder={t('signUpPersonalInfo.fullName')}
            autoCapitalize="words"
            value={fullName}
            onChangeText={setFullName}
          />
          {accountType === 'company' ? (
            <FormInput
              label={t('signUpPersonalInfo.companyName')}
              required
              placeholder={t('signUpPersonalInfo.companyName')}
              autoCapitalize="words"
              value={companyName}
              onChangeText={setCompanyName}
            />
          ) : null}
          <FormInput
            label={t('signUpPersonalInfo.emailOptional')}
            placeholder={t('signUpPersonalInfo.emailOptional')}
            error={emailError ?? undefined}
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              setEmailError(null);
            }}
          />
          <SignupLocationField
            label={t('signUpPersonalInfo.location')}
            required
            value={location}
            loading={locationLoading}
            onChangeText={setLocation}
            onUseCurrentLocation={() => void handleUseCurrentLocation()}
            onSelectOnMap={handleSelectOnMap}
          />
        </View>
      ) : null}

      {step === 'security' ? (
        <View style={styles.securityForm}>
          <View style={styles.mpinGroup}>
            <AppText weight="semibold" style={styles.mpinLabel}>
              {t('signUpSecurity.createLabel')}
            </AppText>
            <CodeInput length={MPIN_LENGTH} value={mpin} onChangeValue={setMpin} secure autoFocus />
          </View>

          <View style={styles.mpinGroup}>
            <AppText weight="semibold" style={styles.mpinLabel}>
              {t('signUpSecurity.confirmLabel')}
            </AppText>
            <CodeInput
              length={MPIN_LENGTH}
              value={confirmMpin}
              onChangeValue={setConfirmMpin}
              secure
              autoFocus={mpin.length === MPIN_LENGTH}
              disabled={mpin.length < MPIN_LENGTH}
            />
          </View>

          {biometricAvailable ? (
            <View style={styles.biometricRow}>
              <View style={styles.biometricText}>
                <AppText weight="bold" style={styles.biometricTitle}>
                  {t('signUpSecurity.biometricTitle')}
                </AppText>
                <AppText style={styles.biometricSubtitle}>
                  {t('signUpSecurity.biometricSubtitle')}
                </AppText>
              </View>
              <Button
                label={biometricEnabled ? t('signUpSecurity.enabled') : t('signUpSecurity.enable')}
                variant={biometricEnabled ? 'secondary' : 'outline'}
                disabled={biometricEnabled}
                onPress={handleEnableBiometric}
              />
            </View>
          ) : null}
        </View>
      ) : null}
      {mapPickerSheet}
    </OnboardingLayout>
  );
}

const styles = StyleSheet.create({
  form: {
    gap: spacing.md,
  },
  accountTypeRow: {
    flexDirection: 'row',
    backgroundColor: palette.softGold,
    borderRadius: radius.pill,
    // padding: 4,
  },
  accountTypeOption: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: radius.pill,
  },
  accountTypeOptionInactive: {
    borderWidth: 0,
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
  securityForm: {
    gap: spacing.xl,
  },
  mpinGroup: {
    gap: spacing.sm,
  },
  mpinLabel: {
    fontSize: 13,
    color: palette.charcoal,
  },
  biometricRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    borderWidth: 1,
    borderColor: palette.softGold,
    borderRadius: radius.lg,
    padding: spacing.md,
  },
  biometricText: {
    flex: 1,
    gap: 2,
  },
  biometricTitle: {
    fontSize: 14,
    color: palette.charcoal,
  },
  biometricSubtitle: {
    fontSize: 12,
    color: palette.muted,
  },
});
