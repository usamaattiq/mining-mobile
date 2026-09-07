import React from 'react';
import { StyleSheet, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { i18n as appI18n } from '@/i18n';
import { OnboardingLayout } from '@/features/auth/components/OnboardingLayout';
import { SIGN_UP_STEPS } from '@/features/auth/constants/onboardingSteps';
import type { RootStackParamList } from '@/navigation/types';
import { FormInput } from '@/shared/components/FormInput';
import { spacing } from '@/shared/theme/tokens';

type Props = NativeStackScreenProps<RootStackParamList, 'SignUpPersonalInfo'>;

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function SignUpPersonalInfoScreen({ navigation, route }: Props): React.ReactElement {
  const { t } = useTranslation(undefined, { i18n: appI18n });
  const { role, phone } = route.params;
  const [fullName, setFullName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [address, setAddress] = React.useState('');

  const isValid = fullName.trim().length > 1 && EMAIL_REGEX.test(email.trim());

  return (
    <OnboardingLayout
      steps={SIGN_UP_STEPS}
      currentStep={3}
      title={t('signUpPersonalInfo.title')}
      subtitle={t('signUpPersonalInfo.subtitle')}
      onBack={() => navigation.goBack()}
      canContinue={isValid}
      continueLabel={t('common.continue')}
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
    </OnboardingLayout>
  );
}

const styles = StyleSheet.create({
  form: {
    gap: spacing.md,
  },
});
