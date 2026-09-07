import React from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import * as LocalAuthentication from 'expo-local-authentication';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { RootStackParamList } from '@/navigation/types';
import { BackButton } from '@/shared/components/BackButton';
import { Button } from '@/shared/components/Button';
import { CodeInput } from '@/shared/components/CodeInput';
import { palette, spacing } from '@/shared/theme/tokens';

type Props = NativeStackScreenProps<RootStackParamList, 'SignUpSecurity'>;

const MPIN_LENGTH = 4;

type Step = 'create' | 'confirm';

export function SignUpSecurityScreen({ navigation }: Props): React.ReactElement {
  const insets = useSafeAreaInsets();
  const [step, setStep] = React.useState<Step>('create');
  const [mpin, setMpin] = React.useState('');
  const [confirmMpin, setConfirmMpin] = React.useState('');
  const [biometricAvailable, setBiometricAvailable] = React.useState(false);
  const [biometricEnabled, setBiometricEnabled] = React.useState(false);

  React.useEffect(() => {
    (async () => {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      setBiometricAvailable(hasHardware && isEnrolled);
    })();
  }, []);

  const currentValue = step === 'create' ? mpin : confirmMpin;
  const isMpinComplete = currentValue.length === MPIN_LENGTH;

  const handleMpinChange = (value: string) => {
    if (step === 'create') {
      setMpin(value);
    } else {
      setConfirmMpin(value);
    }
  };

  const handleContinue = () => {
    if (step === 'create') {
      setStep('confirm');
      return;
    }
    if (confirmMpin !== mpin) {
      Alert.alert('MPIN mismatch', 'The MPIN you entered does not match. Please try again.');
      setConfirmMpin('');
      return;
    }
    finishSetup();
  };

  const handleEnableBiometric = async () => {
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: 'Confirm to enable biometric unlock',
    });
    if (result.success) {
      setBiometricEnabled(true);
    }
  };

  const finishSetup = () => {
    Alert.alert('Account created', 'Your account has been set up successfully.', [
      { text: 'Continue', onPress: () => navigation.replace('Login') },
    ]);
  };

  const handleBack = () => {
    if (step === 'confirm') {
      setConfirmMpin('');
      setStep('create');
      return;
    }
    navigation.goBack();
  };

  return (
    <View
      style={[
        styles.root,
        { paddingTop: Math.max(insets.top, spacing.lg), paddingBottom: insets.bottom },
      ]}
    >
      <BackButton onPress={handleBack} />

      <View style={styles.header}>
        <Text style={styles.title}>
          {step === 'create' ? 'Set your MPIN' : 'Confirm your MPIN'}
        </Text>
        <Text style={styles.subtitle}>
          {step === 'create'
            ? `Choose a ${MPIN_LENGTH}-digit PIN to secure your account.`
            : 'Enter the same PIN again to confirm.'}
        </Text>
      </View>

      <View style={styles.form}>
        <CodeInput
          length={MPIN_LENGTH}
          value={currentValue}
          onChangeValue={handleMpinChange}
          secure
          autoFocus
        />

        {step === 'create' && biometricAvailable ? (
          <View style={styles.biometricRow}>
            <View style={styles.biometricText}>
              <Text style={styles.biometricTitle}>Enable Face ID / biometric unlock</Text>
              <Text style={styles.biometricSubtitle}>
                Use your face or fingerprint for faster sign in. You can always use your MPIN.
              </Text>
            </View>
            <Button
              label={biometricEnabled ? 'Enabled' : 'Enable'}
              variant={biometricEnabled ? 'secondary' : 'outline'}
              disabled={biometricEnabled}
              onPress={handleEnableBiometric}
            />
          </View>
        ) : null}
      </View>

      <View style={styles.footer}>
        <Button
          label={step === 'create' ? 'Continue' : 'Finish'}
          disabled={!isMpinComplete}
          onPress={handleContinue}
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
    gap: spacing.xl,
  },
  biometricRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    borderWidth: 1,
    borderColor: palette.softGold,
    borderRadius: 16,
    padding: spacing.md,
  },
  biometricText: {
    flex: 1,
    gap: 2,
  },
  biometricTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: palette.charcoal,
  },
  biometricSubtitle: {
    fontSize: 12,
    color: palette.muted,
  },
  footer: {
    marginBottom: spacing.xl,
  },
});
