import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { RootStackParamList } from '@/navigation/types';
import { BackButton } from '@/shared/components/BackButton';
import { Button } from '@/shared/components/Button';
import { FormInput } from '@/shared/components/FormInput';
import { palette, spacing } from '@/shared/theme/tokens';

type Props = NativeStackScreenProps<RootStackParamList, 'SignUpPersonalInfo'>;

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function SignUpPersonalInfoScreen({ navigation, route }: Props): React.ReactElement {
  const insets = useSafeAreaInsets();
  const { role, phone } = route.params;
  const [fullName, setFullName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [address, setAddress] = React.useState('');

  const isValid = fullName.trim().length > 1 && EMAIL_REGEX.test(email.trim());

  return (
    <View
      style={[
        styles.root,
        { paddingTop: Math.max(insets.top, spacing.lg), paddingBottom: insets.bottom },
      ]}
    >
      <BackButton onPress={() => navigation.goBack()} />

      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Text style={styles.title}>Tell us about you</Text>
          <Text style={styles.subtitle}>This helps us personalize your account.</Text>
        </View>

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
      </ScrollView>

      <View style={styles.footer}>
        <Button
          label="Continue"
          disabled={!isValid}
          onPress={() =>
            navigation.navigate('SignUpSecurity', {
              role,
              phone,
              fullName: fullName.trim(),
              email: email.trim(),
            })
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
  },
  scrollContent: {
    flexGrow: 1,
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
    marginTop: spacing.lg,
  },
  footer: {
    marginBottom: spacing.xl,
    paddingTop: spacing.md,
  },
});
