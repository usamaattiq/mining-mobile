import React from 'react';
import { StyleSheet, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { OnboardingLayout } from '@/features/auth/components/OnboardingLayout';
import { SIGN_UP_STEPS } from '@/features/auth/constants/onboardingSteps';
import type { RootStackParamList } from '@/navigation/types';
import { FormInput } from '@/shared/components/FormInput';
import { spacing } from '@/shared/theme/tokens';

type Props = NativeStackScreenProps<RootStackParamList, 'SignUpPersonalInfo'>;

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function SignUpPersonalInfoScreen({ navigation, route }: Props): React.ReactElement {
  const { role, phone } = route.params;
  const [fullName, setFullName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [address, setAddress] = React.useState('');

  const isValid = fullName.trim().length > 1 && EMAIL_REGEX.test(email.trim());

  return (
    <OnboardingLayout
      steps={SIGN_UP_STEPS}
      currentStep={3}
      title="Tell us about you"
      subtitle="This helps us personalize your account."
      onBack={() => navigation.goBack()}
      canContinue={isValid}
      onContinue={() =>
        navigation.navigate('SignUpSecurity', {
          role,
          phone,
          fullName: fullName.trim(),
          email: email.trim(),
        })
      }
    >
      <View style={styles.form}>
        <FormInput
          label="Full name"
          placeholder="Full name"
          autoCapitalize="words"
          value={fullName}
          onChangeText={setFullName}
        />
        <FormInput
          label="Email"
          placeholder="Email"
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />
        <FormInput
          label="Address (optional)"
          placeholder="Address"
          value={address}
          onChangeText={setAddress}
        />
      </View>
    </OnboardingLayout>
  );
}

const styles = StyleSheet.create({
  form: {
    gap: spacing.md,
  },
});
