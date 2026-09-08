import React from 'react';
import { Alert, StyleSheet, TouchableOpacity, View } from 'react-native';
import * as LocalAuthentication from 'expo-local-authentication';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { i18n as appI18n } from '@/i18n';
import { OnboardingLayout } from '@/features/auth/components/OnboardingLayout';
import { SIGN_UP_STEPS } from '@/features/auth/constants/onboardingSteps';
import type { RootStackParamList, UserRole } from '@/navigation/types';
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

type SignUpStep = 'role' | 'phone' | 'otp' | 'personal' | 'security';

const STEP_ORDER: SignUpStep[] = ['role', 'phone', 'otp', 'personal', 'security'];

const STEP_INDEX: Record<SignUpStep, number> = {
  role: 0,
  phone: 1,
  otp: 2,
  personal: 3,
  security: 4,
};

type SecuritySubStep = 'create' | 'confirm';

/**
 * One persistent OnboardingLayout; only step content swaps (avoids remount jerk).
 */
export function SignUpFlowScreen({ navigation }: Props): React.ReactElement {
  const { t } = useTranslation(undefined, { i18n: appI18n });
  const { currentLanguage } = useLanguage();

  const [step, setStep] = React.useState<SignUpStep>('role');
  const [, setRole] = React.useState<UserRole | null>(null);
  const [country, setCountry] = React.useState<Country>(defaultCountry);
  const [phoneDigits, setPhoneDigits] = React.useState('');
  const [otp, setOtp] = React.useState('');
  const [secondsLeft, setSecondsLeft] = React.useState(RESEND_SECONDS);
  const [fullName, setFullName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [address, setAddress] = React.useState('');
  const [securityStep, setSecurityStep] = React.useState<SecuritySubStep>('create');
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
    Alert.alert(t('signUpSecurity.successTitle'), t('signUpSecurity.successMessage'), [
      { text: t('common.continue'), onPress: () => navigation.replace('Login') },
    ]);
  };

  const handleSecurityContinue = () => {
    if (securityStep === 'create') {
      setSecurityStep('confirm');
      return;
    }
    if (confirmMpin !== mpin) {
      Alert.alert(t('signUpSecurity.mismatchTitle'), t('signUpSecurity.mismatchMessage'));
      setConfirmMpin('');
      return;
    }
    finishSetup();
  };

  const handleSecurityBack = () => {
    if (securityStep === 'confirm') {
      setConfirmMpin('');
      setSecurityStep('create');
      return;
    }
    goToPreviousStep();
  };

  const isPhoneValid = phoneDigits.trim().length >= 6;
  const isOtpValid = otp.length === OTP_LENGTH;
  const isPersonalValid = fullName.trim().length > 1 && EMAIL_REGEX.test(email.trim());
  const currentMpinValue = securityStep === 'create' ? mpin : confirmMpin;
  const isMpinComplete = currentMpinValue.length === MPIN_LENGTH;

  const roles: Array<{
    value: UserRole;
    title: string;
    description: string;
    icon: keyof typeof Ionicons.glyphMap;
  }> = [
    {
      value: 'buyer',
      title: t('signUpRole.buyerTitle'),
      description: t('signUpRole.buyerDescription'),
      icon: 'cart-outline',
    },
    {
      value: 'supplier',
      title: t('signUpRole.supplierTitle'),
      description: t('signUpRole.supplierDescription'),
      icon: 'storefront-outline',
    },
  ];

  const header =
    step === 'role'
      ? { title: t('signUpRole.title'), subtitle: t('signUpRole.subtitle') }
      : step === 'phone'
        ? { title: t('signUpPhone.title'), subtitle: t('signUpPhone.subtitle') }
        : step === 'otp'
          ? {
              title: t('signUpOtp.title'),
              subtitle: t('signUpOtp.subtitleTemplate', { length: OTP_LENGTH, phone }),
            }
          : step === 'personal'
            ? { title: t('signUpPersonalInfo.title'), subtitle: t('signUpPersonalInfo.subtitle') }
            : {
                title:
                  securityStep === 'create'
                    ? t('signUpSecurity.createTitle')
                    : t('signUpSecurity.confirmTitle'),
                subtitle:
                  securityStep === 'create'
                    ? t('signUpSecurity.createSubtitleTemplate', { length: MPIN_LENGTH })
                    : t('signUpSecurity.confirmSubtitle'),
              };

  const onBack = step === 'security' ? handleSecurityBack : goToPreviousStep;

  return (
    <OnboardingLayout
      steps={SIGN_UP_STEPS}
      currentStep={STEP_INDEX[step]}
      title={header.title}
      subtitle={header.subtitle}
      onBack={onBack}
      showFooter={step !== 'role'}
      canContinue={
        step === 'phone'
          ? isPhoneValid
          : step === 'otp'
            ? isOtpValid
            : step === 'personal'
              ? isPersonalValid
              : step === 'security'
                ? isMpinComplete
                : true
      }
      continueLabel={
        step === 'phone'
          ? t('signUpPhone.sendCode')
          : step === 'otp'
            ? t('signUpOtp.verify')
            : step === 'personal'
              ? t('common.continue')
              : securityStep === 'create'
                ? t('signUpSecurity.continue')
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
      {step === 'role' ? (
        <View style={styles.roleList}>
          {roles.map((option) => (
            <TouchableOpacity
              key={option.value}
              activeOpacity={0.9}
              onPress={() => {
                setRole(option.value);
                goToStep('phone');
              }}
              style={styles.cardShadow}
            >
              <View style={styles.card}>
                <View style={styles.iconWrap}>
                  <Ionicons name={option.icon} size={26} color={palette.pureWhite} />
                </View>
                <View style={styles.cardText}>
                  <AppText weight="bold" style={styles.cardTitle}>
                    {option.title}
                  </AppText>
                  <AppText style={styles.cardDescription}>{option.description}</AppText>
                </View>
                <View style={styles.chevronWrap}>
                  <Ionicons name="chevron-forward" size={18} color={palette.gold} />
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      ) : null}

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
              <TouchableOpacity onPress={() => setSecondsLeft(RESEND_SECONDS)}>
                <AppText weight="bold" style={styles.resendLink}>
                  {t('signUpOtp.resend')}
                </AppText>
              </TouchableOpacity>
            )}
          </View>
        </View>
      ) : null}

      {step === 'personal' ? (
        <View style={styles.form}>
          <FormInput
            label={t('signUpPersonalInfo.fullName')}
            placeholder={t('signUpPersonalInfo.fullName')}
            autoCapitalize="words"
            value={fullName}
            onChangeText={setFullName}
          />
          <FormInput
            label={t('signUpPersonalInfo.email')}
            placeholder={t('signUpPersonalInfo.email')}
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />
          <FormInput
            label={t('signUpPersonalInfo.addressOptional')}
            placeholder={t('signUpPersonalInfo.address')}
            value={address}
            onChangeText={setAddress}
          />
        </View>
      ) : null}

      {step === 'security' ? (
        <View style={styles.securityForm}>
          <CodeInput
            length={MPIN_LENGTH}
            value={currentMpinValue}
            onChangeValue={securityStep === 'create' ? setMpin : setConfirmMpin}
            secure
            autoFocus
          />

          {securityStep === 'create' && biometricAvailable ? (
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
  roleList: {
    gap: spacing.md,
  },
  cardShadow: {
    borderRadius: radius.lg,
    shadowColor: palette.gold,
    shadowOpacity: 0.18,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 14,
    elevation: 3,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radius.lg,
    padding: spacing.md,
    gap: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(201, 162, 39, 0.22)',
    backgroundColor: palette.softGold,
  },
  iconWrap: {
    width: 56,
    height: 56,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.gold,
  },
  cardText: {
    flex: 1,
    gap: 2,
  },
  cardTitle: {
    fontSize: 16,
    color: palette.charcoal,
  },
  cardDescription: {
    fontSize: 12,
    lineHeight: 17,
    color: palette.muted,
  },
  chevronWrap: {
    width: 32,
    height: 32,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(255, 255, 255, 0.72)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  form: {
    gap: spacing.md,
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
  resendLink: {
    fontSize: 13,
    color: palette.gold,
  },
  securityForm: {
    gap: spacing.xl,
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
