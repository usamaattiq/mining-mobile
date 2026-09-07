import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { OnboardingLayout } from '@/features/auth/components/OnboardingLayout';
import { SIGN_UP_STEPS } from '@/features/auth/constants/onboardingSteps';
import type { RootStackParamList } from '@/navigation/types';
import { CodeInput } from '@/shared/components/CodeInput';
import { palette, spacing } from '@/shared/theme/tokens';

type Props = NativeStackScreenProps<RootStackParamList, 'SignUpOtp'>;

const OTP_LENGTH = 6;
const RESEND_SECONDS = 30;

export function SignUpOtpScreen({ navigation, route }: Props): React.ReactElement {
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
      title="Enter verification code"
      subtitle={`We sent a ${OTP_LENGTH}-digit code to ${phone}`}
      onBack={() => navigation.goBack()}
      canContinue={isValid}
      continueLabel="Verify"
      onContinue={() => navigation.navigate('SignUpPersonalInfo', { role, phone })}
    >
      <View style={styles.form}>
        <CodeInput length={OTP_LENGTH} value={otp} onChangeValue={setOtp} />

        <View style={styles.resendRow}>
          {secondsLeft > 0 ? (
            <Text style={styles.resendMuted}>Resend code in {secondsLeft}s</Text>
          ) : (
            <TouchableOpacity onPress={() => setSecondsLeft(RESEND_SECONDS)}>
              <Text style={styles.resendLink}>Resend code</Text>
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
    fontWeight: '700',
    color: palette.gold,
  },
});
