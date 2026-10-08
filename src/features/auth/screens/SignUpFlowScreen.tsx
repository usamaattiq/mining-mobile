import React from 'react';
import { StyleSheet, Switch, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { showAppAlert } from '@/shared/services/appAlert';
import { confirmBiometric } from '@/shared/utils/confirmBiometric';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { i18n as appI18n } from '@/i18n';
import { OnboardingLayout } from '@/features/auth/components/OnboardingLayout';
import { SIGN_UP_STEPS } from '@/features/auth/constants/onboardingSteps';
import { authApi } from '@/features/auth/api/authApi';
import { useLocationMapPicker } from '@/shared/hooks/useLocationMapPicker';
import { LocationField } from '@/shared/components/LocationField';
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
import { useMarketplaceRoleStore } from '@/store/marketplaceRoleStore';
import { useDevicePrefsStore } from '@/store/devicePrefsStore';
import { useProfileStore } from '@/store/profileStore';
import { getDeviceId } from '@/shared/utils/deviceId';
import { ApiError } from '@/shared/services/api';
import { AppText } from '@/shared/components/AppText';
import { Button } from '@/shared/components/Button';
import { useDeviceBiometric } from '@/shared/hooks/useDeviceBiometric';
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

type SignUpStep = 'phone' | 'otp' | 'personal' | 'security' | 'face';

const STEP_ORDER: SignUpStep[] = ['phone', 'otp', 'personal', 'security', 'face'];

const STEP_INDEX: Record<SignUpStep, number> = {
  phone: 0,
  otp: 1,
  personal: 2,
  security: 3,
  face: 4,
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
  const [biometricEnabled, setBiometricEnabled] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);
  const { locationLoading, getCurrentLocation, openMapPickerForSelection, mapPickerSheet } =
    useLocationMapPicker();
  const { available: biometricAvailable, kind: biometricKind } = useDeviceBiometric();

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
      showAppAlert(t('common.error'), t('location.locationFailed'));
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

  const handleToggleBiometric = async (enabled: boolean) => {
    if (!enabled) {
      setBiometricEnabled(false);
      return;
    }
    setBiometricEnabled(true);
    const result = await confirmBiometric(t('signUpSecurity.biometricPrompt'), t('common.cancel'));
    setBiometricEnabled(result.success);
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
      showAppAlert(t('common.error'), errorMessage(error, t('signUpOtp.verifyFailed')));
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
      showAppAlert(t('common.error'), errorMessage(error, t('signUpPhone.sendFailed')));
    } finally {
      setSubmitting(false);
    }
  };

  const handleSecurityContinue = () => {
    if (confirmMpin !== mpin) {
      showAppAlert(t('signUpSecurity.mismatchTitle'), t('signUpSecurity.mismatchMessage'));
      setConfirmMpin('');
      return;
    }
    goToStep('face');
  };

  const handleFinishSignup = async () => {
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
      setProfile(result.profile);
      await Promise.all([
        setAuthenticated(result.accessToken, result.refreshToken),
        useMarketplaceRoleStore.getState().setRole('supplier'),
        setLastPhone({
          countryCode: country.iso2,
          countryCallingCode: country.dialCode.replace(/^\+/, ''),
          phoneDigits: phoneDigits.trim(),
        }),
        biometricEnabled ? setCachedMpin(mpin) : Promise.resolve(),
        setDeviceBiometricEnabled(biometricEnabled),
      ]);

      if (avatarAsset) {
        const pendingAvatar = avatarAsset;
        void (async () => {
          try {
            const { url } = await uploadMedia(pendingAvatar);
            const updatedProfile = await authApi.updateMe({ avatarUrl: url });
            setProfile(updatedProfile);
          } catch {
            // Avatar upload failing shouldn't block account creation; user can retry from profile.
          }
        })();
      }

      navigation.replace('Welcome');
    } catch (error) {
      if (error instanceof ApiError && error.status === 409 && /email/i.test(error.message)) {
        setEmailError(t('signUpPersonalInfo.emailAlreadyExists'));
        goToStep('personal');
        return;
      }
      showAppAlert(t('common.error'), errorMessage(error, t('signUpSecurity.mismatchMessage')));
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

  const isFingerprint = biometricKind === 'fingerprint';
  const faceTitle = t(isFingerprint ? 'signUpFace.titleBiometric' : 'signUpFace.title');
  const faceBody = !biometricAvailable
    ? t(isFingerprint ? 'signUpFace.unavailableBiometric' : 'signUpFace.unavailable')
    : t(isFingerprint ? 'signUpFace.subtitleBiometric' : 'signUpFace.subtitle');

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
          : step === 'security'
            ? {
                title: t('signUpSecurity.title'),
                subtitle: t('signUpSecurity.subtitleTemplate', { length: MPIN_LENGTH }),
              }
            : {
                title: faceTitle,
                subtitle: t('signUpFace.headerSubtitle'),
              };

  return (
    <OnboardingLayout
      steps={SIGN_UP_STEPS}
      currentStep={STEP_INDEX[step]}
      title={header.title}
      subtitle={header.subtitle}
      avoidKeyboard={step !== 'security'}
      onBack={step === 'phone' || step === 'otp' || step === 'face' ? goToPreviousStep : undefined}
      canContinue={
        (step === 'phone'
          ? isPhoneValid
          : step === 'otp'
            ? isOtpValid
            : step === 'personal'
              ? isPersonalValid
              : step === 'security'
                ? isMpinComplete
                : true) && !submitting
      }
      continueLabel={
        step === 'phone'
          ? t('signUpPhone.sendCode')
          : step === 'otp'
            ? t('signUpOtp.verify')
            : step === 'personal' || step === 'security'
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
          handleSecurityContinue();
        } else if (step === 'face') {
          void handleFinishSignup();
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
            onChangeUrl={() => {}}
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
            placeholder={t('signUpPersonalInfo.emailPlaceholder')}
            error={
              email.trim().length > 0 && !EMAIL_REGEX.test(email.trim())
                ? t('signUpPersonalInfo.emailInvalid')
                : (emailError ?? undefined)
            }
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              setEmailError(null);
            }}
          />
          <LocationField
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
              autoFocus={false}
            />
          </View>
        </View>
      ) : null}

      {step === 'face' ? (
        <View style={styles.faceStep}>
          <View style={styles.faceHalo}>
            <View style={styles.faceIcon}>
              <MaterialCommunityIcons
                name={biometricKind === 'fingerprint' ? 'fingerprint' : 'face-recognition'}
                size={64}
                color={palette.goldDark}
              />
            </View>
          </View>
          <View style={styles.faceCard}>
            <View style={styles.faceCopy}>
              <AppText weight="semibold" style={styles.faceCardTitle}>
                {faceTitle}
              </AppText>
              <AppText style={styles.faceCardBody}>
                {faceBody}
              </AppText>
            </View>
            <Switch
              value={biometricEnabled}
              onValueChange={(enabled) => void handleToggleBiometric(enabled)}
              disabled={!biometricAvailable && !biometricEnabled}
              trackColor={{ true: palette.gold, false: palette.softGold }}
              thumbColor={palette.pureWhite}
            />
          </View>
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
  faceStep: {
    flex: 1,
    alignItems: 'center',
    gap: spacing.xl,
    paddingTop: spacing.lg,
  },
  faceHalo: {
    width: 168,
    height: 168,
    borderRadius: radius.pill,
    backgroundColor: palette.softGold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  faceIcon: {
    width: 120,
    height: 120,
    borderRadius: radius.pill,
    backgroundColor: palette.pureWhite,
    alignItems: 'center',
    justifyContent: 'center',
  },
  faceCard: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: palette.warmWhite,
    borderWidth: 1,
    borderColor: palette.softGold,
    borderRadius: radius.lg,
    padding: spacing.md,
  },
  faceCopy: {
    flex: 1,
    gap: spacing.xs,
  },
  faceCardTitle: {
    fontSize: 16,
    color: palette.charcoal,
  },
  faceCardBody: {
    fontSize: 13,
    lineHeight: 18,
    color: palette.muted,
  },
});
