import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { i18n as appI18n } from '@/i18n';
import { OnboardingLayout } from '@/features/auth/components/OnboardingLayout';
import { SIGN_UP_STEPS } from '@/features/auth/constants/onboardingSteps';
import type { RootStackParamList, UserRole } from '@/navigation/types';
import { AppText } from '@/shared/components/AppText';
import { palette, radius, spacing } from '@/shared/theme/tokens';

type Props = NativeStackScreenProps<RootStackParamList, 'SignUpRole'>;

export function SignUpRoleScreen({ navigation }: Props): React.ReactElement {
  const { t } = useTranslation(undefined, { i18n: appI18n });

  const roles: Array<{
    value: UserRole;
    title: string;
    description: string;
    icon: keyof typeof Ionicons.glyphMap;
  }> = [
    {
      value: 'buyer',
      title: t('signUpRole.buyerTitle'),
      description: t('signUpRole.buyerDescription'),
      icon: 'cart-outline',
    },
    {
      value: 'supplier',
      title: t('signUpRole.supplierTitle'),
      description: t('signUpRole.supplierDescription'),
      icon: 'storefront-outline',
    },
  ];

  return (
    <OnboardingLayout
      steps={SIGN_UP_STEPS}
      currentStep={0}
      title={t('signUpRole.title')}
      subtitle={t('signUpRole.subtitle')}
      onBack={() => navigation.goBack()}
      showFooter={false}
    >
      <View style={styles.roleList}>
        {roles.map((option) => (
          <Pressable
            key={option.value}
            onPress={() => navigation.navigate('SignUpPhone', { role: option.value })}
            style={({ pressed }) => [styles.cardShadow, pressed && styles.pressed]}
          >
            <View style={styles.card}>
              <View style={styles.iconWrap}>
                <Ionicons name={option.icon} size={26} color={palette.pureWhite} />
              </View>
              <View style={styles.cardText}>
                <AppText weight="bold" style={styles.cardTitle}>
                  {option.title}
                </AppText>
                <AppText style={styles.cardDescription}>{option.description}</AppText>
              </View>
              <View style={styles.chevronWrap}>
                <Ionicons name="chevron-forward" size={18} color={palette.gold} />
              </View>
            </View>
          </Pressable>
        ))}
      </View>
    </OnboardingLayout>
  );
}

const styles = StyleSheet.create({
  roleList: {
    gap: spacing.md,
  },
  pressed: {
    opacity: 0.9,
  },
  cardShadow: {
    borderRadius: radius.lg,
    shadowColor: palette.gold,
    shadowOpacity: 0.18,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 14,
    elevation: 3,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radius.lg,
    padding: spacing.md,
    gap: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(201, 162, 39, 0.22)',
    backgroundColor: palette.softGold,
  },
  iconWrap: {
    width: 56,
    height: 56,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.gold,
  },
  cardText: {
    flex: 1,
    gap: 2,
  },
  cardTitle: {
    fontSize: 16,
    color: palette.charcoal,
  },
  cardDescription: {
    fontSize: 12,
    lineHeight: 17,
    color: palette.muted,
  },
  chevronWrap: {
    width: 32,
    height: 32,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(255, 255, 255, 0.72)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
