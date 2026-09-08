import React from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { i18n as appI18n } from '@/i18n';
import { OnboardingLayout } from '@/features/auth/components/OnboardingLayout';
import { LOGIN_STEPS } from '@/features/auth/constants/onboardingSteps';
import type { RootStackParamList } from '@/navigation/types';
import { useLanguage } from '@/i18n/hooks/useLanguage';
import { AppText } from '@/shared/components/AppText';
import { Button } from '@/shared/components/Button';
import { CodeInput } from '@/shared/components/CodeInput';
import { CountryPicker } from '@/shared/components/country-picker';
import { defaultCountry, type Country } from '@/shared/constants/countries';
import { FormInput } from '@/shared/components/FormInput';
import { palette, spacing } from '@/shared/theme/tokens';
import { getFontFamily } from '@/shared/theme/typography';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

const OTP_LENGTH = 6;
const RESEND_SECONDS = 30;
const MPIN_LENGTH = 4;

type LoginStep = 'phone' | 'otp' | 'mpin';

const STEP_ORDER: LoginStep[] = ['phone', 'otp', 'mpin'];

const STEP_INDEX: Record<LoginStep, number> = {
  phone: 0,
  otp: 1,
  mpin: 2,
};

export function LoginScreen({ navigation }: Props): React.ReactElement {
  const { t } = useTranslation(undefined, { i18n: appI18n });
  const { currentLanguage } = useLanguage();

  const [step, setStep] = React.useState<LoginStep>('phone');
  const [country, setCountry] = React.useState<Country>(defaultCountry);
  const [phoneDigits, setPhoneDigits] = React.useState('');
  const [otp, setOtp] = React.useState('');
  const [secondsLeft, setSecondsLeft] = React.useState(RESEND_SECONDS);
  const [mpin, setMpin] = React.useState('');

  const phone = `${country.dialCode}${phoneDigits.trim()}`;

  React.useEffect(() => {
    if (step !== 'otp' || secondsLeft <= 0) return;
    const timer = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [step, secondsLeft]);

  const goToStep = (next: LoginStep) => setStep(next);

  const goToPreviousStep = () => {
    const index = STEP_ORDER.indexOf(step);
    if (index > 0) {
      goToStep(STEP_ORDER[index - 1]!);
      return;
    }
    navigation.goBack();
  };

  const handleLogIn = () => {
    // Placeholder until backend auth is wired up.
    Alert.alert(t('loginMpin.logIn'), '');
  };

  const isPhoneValid = phoneDigits.trim().length >= 6;
  const isOtpValid = otp.length === OTP_LENGTH;
  const isMpinValid = mpin.length === MPIN_LENGTH;

  const header =
    step === 'phone'
      ? { title: t('loginPhone.title'), subtitle: t('loginPhone.subtitle') }
      : step === 'otp'
        ? {
            title: t('loginOtp.title'),
            subtitle: t('loginOtp.subtitleTemplate', { length: OTP_LENGTH, phone }),
          }
        : {
            title: t('loginMpin.title'),
            subtitle: t('loginMpin.subtitleTemplate', { length: MPIN_LENGTH }),
          };

  return (
    <OnboardingLayout
      steps={LOGIN_STEPS}
      currentStep={STEP_INDEX[step]}
      title={header.title}
      subtitle={header.subtitle}
      onBack={goToPreviousStep}
      canContinue={step === 'phone' ? isPhoneValid : step === 'otp' ? isOtpValid : isMpinValid}
      continueLabel={
        step === 'phone'
          ? t('loginPhone.sendCode')
          : step === 'otp'
            ? t('loginOtp.verify')
            : t('loginMpin.logIn')
      }
      onContinue={() => {
        if (step === 'phone') {
          goToStep('otp');
        } else if (step === 'otp') {
          goToStep('mpin');
        } else {
          handleLogIn();
        }
      }}
    >
      {step === 'phone' ? (
        <View style={styles.form}>
          <FormInput
            label={t('loginPhone.label')}
            placeholder={t('loginPhone.placeholder')}
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
                {t('loginOtp.resendIn', { seconds: secondsLeft })}
              </AppText>
            ) : (
              <Button
                label={t('loginOtp.resend')}
                variant="link"
                onPress={() => setSecondsLeft(RESEND_SECONDS)}
              />
            )}
          </View>
        </View>
      ) : null}

      {step === 'mpin' ? (
        <View style={styles.form}>
          <CodeInput length={MPIN_LENGTH} value={mpin} onChangeValue={setMpin} secure autoFocus />
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
    fontSize: 18,
  },
  resendRow: {
    alignItems: 'center',
  },
  resendMuted: {
    fontSize: 13,
    color: palette.muted,
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
