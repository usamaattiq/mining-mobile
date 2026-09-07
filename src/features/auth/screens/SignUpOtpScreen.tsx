import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { i18n as appI18n } from '@/i18n';
import { OnboardingLayout } from '@/features/auth/components/OnboardingLayout';
import { SIGN_UP_STEPS } from '@/features/auth/constants/onboardingSteps';
import type { RootStackParamList } from '@/navigation/types';
import { AppText } from '@/shared/components/AppText';
import { CodeInput } from '@/shared/components/CodeInput';
import { palette, spacing } from '@/shared/theme/tokens';

type Props = NativeStackScreenProps<RootStackParamList, 'SignUpOtp'>;

const OTP_LENGTH = 6;
const RESEND_SECONDS = 30;

export function SignUpOtpScreen({ navigation, route }: Props): React.ReactElement {
  const { t } = useTranslation(undefined, { i18n: appI18n });
  const { role, phone } = route.params;
  const [otp, setOtp] = React.useState('');
  const [secondsLeft, setSecondsLeft] = React.useState(RESEND_SECONDS);

  React.useEffect(() => {
    if (secondsLeft <= 0) return;
    const timer = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [secondsLeft]);

  const isValid = otp.length === OTP_LENGTH;

  return (
    <OnboardingLayout
      steps={SIGN_UP_STEPS}
      currentStep={2}
      title={t('signUpOtp.title')}
      subtitle={t('signUpOtp.subtitleTemplate', { length: OTP_LENGTH, phone })}
      onBack={() => navigation.goBack()}
      canContinue={isValid}
      continueLabel={t('signUpOtp.verify')}
      onContinue={() => navigation.navigate('SignUpPersonalInfo', { role, phone })}
    >
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
    </OnboardingLayout>
  );
}

const styles = StyleSheet.create({
  form: {
    gap: spacing.lg,
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
});
