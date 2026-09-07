import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { RootStackParamList } from '@/navigation/types';
import { BackButton } from '@/shared/components/BackButton';
import { Button } from '@/shared/components/Button';
import { CodeInput } from '@/shared/components/CodeInput';
import { palette, spacing } from '@/shared/theme/tokens';

type Props = NativeStackScreenProps<RootStackParamList, 'SignUpOtp'>;

const OTP_LENGTH = 6;
const RESEND_SECONDS = 30;

export function SignUpOtpScreen({ navigation, route }: Props): React.ReactElement {
  const insets = useSafeAreaInsets();
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
    <View
      style={[
        styles.root,
        { paddingTop: Math.max(insets.top, spacing.lg), paddingBottom: insets.bottom },
      ]}
    >
      <BackButton onPress={() => navigation.goBack()} />

      <View style={styles.header}>
        <Text style={styles.title}>Enter verification code</Text>
        <Text style={styles.subtitle}>
          We sent a {OTP_LENGTH}-digit code to {phone}
        </Text>
      </View>

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

      <View style={styles.footer}>
        <Button
          label="Verify"
          disabled={!isValid}
          onPress={() => navigation.navigate('SignUpPersonalInfo', { role, phone })}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: palette.pureWhite,
    paddingHorizontal: spacing.lg,
    justifyContent: 'space-between',
  },
  header: {
    marginTop: spacing.xl,
    gap: spacing.xs,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: palette.charcoal,
  },
  subtitle: {
    fontSize: 14,
    color: palette.muted,
  },
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
  footer: {
    marginBottom: spacing.xl,
  },
});
