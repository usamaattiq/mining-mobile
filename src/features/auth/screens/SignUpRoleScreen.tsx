import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { OnboardingLayout } from '@/features/auth/components/OnboardingLayout';
import { SIGN_UP_STEPS } from '@/features/auth/constants/onboardingSteps';
import type { RootStackParamList, UserRole } from '@/navigation/types';
import { palette, radius, spacing } from '@/shared/theme/tokens';

type Props = NativeStackScreenProps<RootStackParamList, 'SignUpRole'>;

const ROLES: Array<{
  value: UserRole;
  title: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
}> = [
  {
    value: 'buyer',
    title: 'Buyer',
    description: 'Browse and order equipment, services, products and gold.',
    icon: 'cart-outline',
  },
  {
    value: 'supplier',
    title: 'Supplier',
    description: 'List and sell your equipment, services, products and gold.',
    icon: 'storefront-outline',
  },
];

export function SignUpRoleScreen({ navigation }: Props): React.ReactElement {
  return (
    <OnboardingLayout
      steps={SIGN_UP_STEPS}
      currentStep={0}
      title="How will you use MineMarket?"
      subtitle="Choose a role to get started. You can change this later in settings."
      onBack={() => navigation.goBack()}
      showFooter={false}
    >
      <View style={styles.roleList}>
        {ROLES.map((option) => (
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
                <Text style={styles.cardTitle}>{option.title}</Text>
                <Text style={styles.cardDescription}>{option.description}</Text>
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
    fontWeight: '700',
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
