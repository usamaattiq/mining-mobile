import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { RootStackParamList } from '@/navigation/types';
import { BackButton } from '@/shared/components/BackButton';
import { Button } from '@/shared/components/Button';
import { FormInput } from '@/shared/components/FormInput';
import { palette, spacing } from '@/shared/theme/tokens';

type Props = NativeStackScreenProps<RootStackParamList, 'SignUpPhone'>;

export function SignUpPhoneScreen({ navigation, route }: Props): React.ReactElement {
  const insets = useSafeAreaInsets();
  const [phone, setPhone] = React.useState('');
  const isValid = phone.trim().length >= 7;

  return (
    <View
      style={[
        styles.root,
        { paddingTop: Math.max(insets.top, spacing.lg), paddingBottom: insets.bottom },
      ]}
    >
      <BackButton onPress={() => navigation.goBack()} />

      <View style={styles.header}>
        <Text style={styles.title}>What&apos;s your number?</Text>
        <Text style={styles.subtitle}>We&apos;ll send you a verification code by SMS.</Text>
      </View>

      <View style={styles.form}>
        <FormInput
          label="Phone number"
          placeholder="+1 555 000 0000"
          keyboardType="phone-pad"
          autoFocus
          value={phone}
          onChangeText={setPhone}
        />
      </View>

      <View style={styles.footer}>
        <Button
          label="Send code"
          disabled={!isValid}
          onPress={() =>
            navigation.navigate('SignUpOtp', { role: route.params.role, phone: phone.trim() })
          }
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
    gap: spacing.md,
  },
  footer: {
    marginBottom: spacing.xl,
  },
});
