import React from 'react';
import { StyleSheet, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { i18n as appI18n } from '@/i18n';
import { OnboardingLayout } from '@/features/auth/components/OnboardingLayout';
import { SIGN_UP_STEPS } from '@/features/auth/constants/onboardingSteps';
import type { RootStackParamList } from '@/navigation/types';
import { useLanguage } from '@/i18n/hooks/useLanguage';
import { CountryPicker } from '@/shared/components/country-picker';
import { defaultCountry, type Country } from '@/shared/constants/countries';
import { FormInput } from '@/shared/components/FormInput';
import { spacing } from '@/shared/theme/tokens';
import { getFontFamily } from '@/shared/theme/typography';

type Props = NativeStackScreenProps<RootStackParamList, 'SignUpPhone'>;

export function SignUpPhoneScreen({ navigation, route }: Props): React.ReactElement {
  const { t } = useTranslation(undefined, { i18n: appI18n });
  const { currentLanguage } = useLanguage();
  const [country, setCountry] = React.useState<Country>(defaultCountry);
  const [phone, setPhone] = React.useState('');
  const isValid = phone.trim().length >= 6;

  return (
    <OnboardingLayout
      steps={SIGN_UP_STEPS}
      currentStep={1}
      title={t('signUpPhone.title')}
      subtitle={t('signUpPhone.subtitle')}
      onBack={() => navigation.goBack()}
      canContinue={isValid}
      continueLabel={t('signUpPhone.sendCode')}
      onContinue={() =>
        navigation.navigate('SignUpOtp', {
          role: route.params.role,
          phone: `${country.dialCode}${phone.trim()}`,
        })
      }
    >
      <View style={styles.form}>
        <FormInput
          label={t('signUpPhone.label')}
          placeholder={t('signUpPhone.placeholder')}
          keyboardType="phone-pad"
          autoFocus
          value={phone}
          onChangeText={setPhone}
          leftAdornment={<CountryPicker value={country} onChange={setCountry} />}
          style={[styles.phoneInput, { fontFamily: getFontFamily(currentLanguage, 'semibold') }]}
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
  },
});
