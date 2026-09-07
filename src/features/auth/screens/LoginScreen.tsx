import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { i18n as appI18n } from '@/i18n';
import type { RootStackParamList } from '@/navigation/types';
import { AppText } from '@/shared/components/AppText';
import { AppTopBar } from '@/shared/components/AppTopBar';
import { Button } from '@/shared/components/Button';
import { FormInput } from '@/shared/components/FormInput';
import { palette, spacing } from '@/shared/theme/tokens';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

export function LoginScreen({ navigation }: Props): React.ReactElement {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation(undefined, { i18n: appI18n });
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');

  return (
    <View style={[styles.root, { paddingBottom: insets.bottom }]}>
      <AppTopBar
        left={navigation.canGoBack() ? 'back' : 'none'}
        title={t('login.title')}
        onBackPress={() => navigation.goBack()}
      />

      <View style={styles.content}>
        <View style={styles.header}>
          <AppText weight="bold" style={styles.title}>
            {t('login.welcomeBack')}
          </AppText>
          <AppText style={styles.subtitle}>{t('login.subtitle')}</AppText>
        </View>

        <View style={styles.form}>
          <FormInput
            placeholder={t('login.email')}
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />
          <FormInput
            placeholder={t('login.password')}
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

          <Button label={t('login.logIn')} style={styles.primaryButton} />
        </View>

        <View style={styles.footer}>
          <AppText style={styles.footerText}>{t('login.noAccount')}</AppText>
          <TouchableOpacity onPress={() => navigation.navigate('SignUpRole')}>
            <AppText weight="bold" style={styles.footerLink}>
              {t('login.signUp')}
            </AppText>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: palette.pureWhite,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    justifyContent: 'space-between',
  },
  header: {
    marginTop: spacing.md,
    gap: spacing.xs,
  },
  title: {
    fontSize: 26,
    color: palette.charcoal,
  },
  subtitle: {
    fontSize: 14,
    color: palette.muted,
  },
  form: {
    gap: spacing.md,
  },
  primaryButton: {
    marginTop: spacing.sm,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.xs,
    marginBottom: spacing.xl,
  },
  footerText: {
    fontSize: 14,
    color: palette.muted,
  },
  footerLink: {
    fontSize: 14,
    color: palette.gold,
  },
});
