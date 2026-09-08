import React from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import * as LocalAuthentication from 'expo-local-authentication';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { i18n as appI18n } from '@/i18n';
import { OnboardingLayout } from '@/features/auth/components/OnboardingLayout';
import { SIGN_UP_STEPS } from '@/features/auth/constants/onboardingSteps';
import type { RootStackParamList } from '@/navigation/types';
import { useLanguage } from '@/i18n/hooks/useLanguage';
import { AppText } from '@/shared/components/AppText';
import { Button } from '@/shared/components/Button';
import { CodeInput } from '@/shared/components/CodeInput';
import { CountryPicker } from '@/shared/components/country-picker';
import { defaultCountry, type Country } from '@/shared/constants/countries';
import { FormInput } from '@/shared/components/FormInput';
import { palette, radius, spacing } from '@/shared/theme/tokens';
import { getFontFamily } from '@/shared/theme/typography';

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

  const [step, setStep] = React.useState<SignUpStep>('phone');
  const [country, setCountry] = React.useState<Country>(defaultCountry);
  const [phoneDigits, setPhoneDigits] = React.useState('');
  const [otp, setOtp] = React.useState('');
  const [secondsLeft, setSecondsLeft] = React.useState(RESEND_SECONDS);
  const [accountType, setAccountType] = React.useState<AccountType>('individual');
  const [fullName, setFullName] = React.useState('');
  const [companyName, setCompanyName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [location, setLocation] = React.useState('');
  const [mpin, setMpin] = React.useState('');
  const [confirmMpin, setConfirmMpin] = React.useState('');
  const [biometricAvailable, setBiometricAvailable] = React.useState(false);
  const [biometricEnabled, setBiometricEnabled] = React.useState(false);

  const phone = `${country.dialCode}${phoneDigits.trim()}`;

  React.useEffect(() => {
    if (step !== 'otp' || secondsLeft <= 0) return;
    const timer = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [step, secondsLeft]);

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

  const handleEnableBiometric = async () => {
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: t('signUpSecurity.biometricPrompt'),
    });
    if (result.success) {
      setBiometricEnabled(true);
    }
  };

  const finishSetup = () => {
    navigation.replace('Welcome');
  };

  const handleSecurityContinue = () => {
    if (confirmMpin !== mpin) {
      Alert.alert(t('signUpSecurity.mismatchTitle'), t('signUpSecurity.mismatchMessage'));
      setConfirmMpin('');
      return;
    }
    finishSetup();
  };

  const isPhoneValid = phoneDigits.trim().length >= 6;
  const isOtpValid = otp.length === OTP_LENGTH;
  const isPersonalValid =
    (accountType === 'individual' ? fullName.trim().length > 1 : companyName.trim().length > 1) &&
    location.trim().length > 1 &&
    (email.trim().length === 0 || EMAIL_REGEX.test(email.trim()));
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
      onBack={goToPreviousStep}
      canContinue={
        step === 'phone'
          ? isPhoneValid
          : step === 'otp'
            ? isOtpValid
            : step === 'personal'
              ? isPersonalValid
              : isMpinComplete
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
        if (step === 'phone') {
          goToStep('otp');
        } else if (step === 'otp') {
          goToStep('personal');
        } else if (step === 'personal') {
          goToStep('security');
        } else if (step === 'security') {
          handleSecurityContinue();
        }
      }}
    >
      {step === 'phone' ? (
        <View style={styles.form}>
          <FormInput
            label={t('signUpPhone.label')}
            placeholder={t('signUpPhone.placeholder')}
            keyboardType="phone-pad"
            autoFocus
            value={phoneDigits}
            onChangeText={setPhoneDigits}
            leftAdornment={<CountryPicker value={country} onChange={setCountry} />}
            style={[styles.phoneInput, { fontFamily: getFontFamily(currentLanguage, 'semibold') }]}
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
                onPress={() => setSecondsLeft(RESEND_SECONDS)}
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

          {accountType === 'individual' ? (
            <FormInput
              label={t('signUpPersonalInfo.fullName')}
              placeholder={t('signUpPersonalInfo.fullName')}
              autoCapitalize="words"
              value={fullName}
              onChangeText={setFullName}
            />
          ) : (
            <FormInput
              label={t('signUpPersonalInfo.companyName')}
              placeholder={t('signUpPersonalInfo.companyName')}
              autoCapitalize="words"
              value={companyName}
              onChangeText={setCompanyName}
            />
          )}
          <FormInput
            label={t('signUpPersonalInfo.emailOptional')}
            placeholder={t('signUpPersonalInfo.emailOptional')}
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />
          <FormInput
            label={t('signUpPersonalInfo.location')}
            placeholder={t('signUpPersonalInfo.location')}
            value={location}
            onChangeText={setLocation}
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
    fontSize: 18,
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
