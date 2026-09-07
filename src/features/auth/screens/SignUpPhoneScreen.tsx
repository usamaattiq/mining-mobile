import React from 'react';
import { StyleSheet, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { OnboardingLayout } from '@/features/auth/components/OnboardingLayout';
import { SIGN_UP_STEPS } from '@/features/auth/constants/onboardingSteps';
import type { RootStackParamList } from '@/navigation/types';
import { CountryPicker } from '@/shared/components/country-picker';
import { defaultCountry, type Country } from '@/shared/constants/countries';
import { FormInput } from '@/shared/components/FormInput';
import { spacing } from '@/shared/theme/tokens';

type Props = NativeStackScreenProps<RootStackParamList, 'SignUpPhone'>;

export function SignUpPhoneScreen({ navigation, route }: Props): React.ReactElement {
  const [country, setCountry] = React.useState<Country>(defaultCountry);
  const [phone, setPhone] = React.useState('');
  const isValid = phone.trim().length >= 6;

  return (
    <OnboardingLayout
      steps={SIGN_UP_STEPS}
      currentStep={1}
      title="What's your number?"
      subtitle="We'll send you a verification code by SMS."
      onBack={() => navigation.goBack()}
      canContinue={isValid}
      continueLabel="Send code"
      onContinue={() =>
        navigation.navigate('SignUpOtp', {
          role: route.params.role,
          phone: `${country.dialCode}${phone.trim()}`,
        })
      }
    >
      <View style={styles.form}>
        <FormInput
          label="Phone number"
          placeholder="555 000 0000"
          keyboardType="phone-pad"
          autoFocus
          value={phone}
          onChangeText={setPhone}
          leftAdornment={<CountryPicker value={country} onChange={setCountry} />}
          style={styles.phoneInput}
        />
      </View>
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
    fontWeight: '600',
  },
});
