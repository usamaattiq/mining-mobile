import React from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import * as LocalAuthentication from 'expo-local-authentication';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { i18n as appI18n } from '@/i18n';
import { OnboardingLayout } from '@/features/auth/components/OnboardingLayout';
import { SIGN_UP_STEPS } from '@/features/auth/constants/onboardingSteps';
import type { RootStackParamList } from '@/navigation/types';
import { AppText } from '@/shared/components/AppText';
import { Button } from '@/shared/components/Button';
import { CodeInput } from '@/shared/components/CodeInput';
import { palette, radius, spacing } from '@/shared/theme/tokens';

type Props = NativeStackScreenProps<RootStackParamList, 'SignUpSecurity'>;

const MPIN_LENGTH = 4;

type Step = 'create' | 'confirm';

export function SignUpSecurityScreen({ navigation }: Props): React.ReactElement {
  const { t } = useTranslation(undefined, { i18n: appI18n });
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
      Alert.alert(t('signUpSecurity.mismatchTitle'), t('signUpSecurity.mismatchMessage'));
      setConfirmMpin('');
      return;
    }
    finishSetup();
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

  const handleBack = () => {
    if (step === 'confirm') {
      setConfirmMpin('');
      setStep('create');
      return;
    }
    navigation.goBack();
  };

  return (
    <OnboardingLayout
      steps={SIGN_UP_STEPS}
      currentStep={4}
      title={step === 'create' ? t('signUpSecurity.createTitle') : t('signUpSecurity.confirmTitle')}
      subtitle={
        step === 'create'
          ? t('signUpSecurity.createSubtitleTemplate', { length: MPIN_LENGTH })
          : t('signUpSecurity.confirmSubtitle')
      }
      onBack={handleBack}
      canContinue={isMpinComplete}
      continueLabel={step === 'create' ? t('signUpSecurity.continue') : t('signUpSecurity.finish')}
      onContinue={handleContinue}
    >
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
    </OnboardingLayout>
  );
}

const styles = StyleSheet.create({
  form: {
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
