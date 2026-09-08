import React from 'react';
import { Platform, Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { OnboardingHeadline } from '@/features/auth/components/OnboardingHeadline';
import { OnboardingProgressBar } from '@/features/auth/components/OnboardingProgressBar';
import type { OnboardingStep } from '@/features/auth/components/OnboardingStepper';
import { AppText } from '@/shared/components/AppText';
import { LanguageSwitcher } from '@/shared/components/language-switcher';
import { palette, radius, spacing } from '@/shared/theme/tokens';

type OnboardingLayoutProps = {
  steps: OnboardingStep[];
  currentStep: number;
  title: string;
  subtitle?: string;
  onBack?: () => void;
  onContinue?: () => void;
  canContinue?: boolean;
  continueLabel?: string;
  /** Hide the footer continue button (e.g. role-selection cards navigate on their own). */
  showFooter?: boolean;
  children: React.ReactNode;
};

export function OnboardingLayout({
  steps,
  currentStep,
  title,
  subtitle,
  onBack,
  onContinue,
  canContinue = true,
  continueLabel = 'Continue',
  showFooter = true,
  children,
}: OnboardingLayoutProps): React.ReactElement {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.root}>
      <StatusBar style="light" />

      <View style={[styles.hero, { paddingTop: insets.top + spacing.md }]}>
        <View style={styles.topBar}>
          {onBack ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Go back"
              onPress={onBack}
              hitSlop={12}
              style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
            >
              <Ionicons name="chevron-back" size={20} color={palette.pureWhite} />
            </Pressable>
          ) : (
            <View style={styles.backSpacer} />
          )}
          <LanguageSwitcher />
        </View>

        <OnboardingProgressBar totalSteps={steps.length} currentStep={currentStep} />

        <OnboardingHeadline title={title} subtitle={subtitle} dark />
      </View>

      <View style={styles.sheet}>
        <KeyboardAwareScrollView
          style={styles.flex}
          contentContainerStyle={[
            styles.sheetContent,
            { paddingBottom: Math.max(insets.bottom, spacing.lg) },
          ]}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          showsVerticalScrollIndicator={false}
          bottomOffset={spacing.md}
        >
          {children}

          {showFooter ? (
            <Pressable
              disabled={!canContinue}
              onPress={onContinue}
              accessibilityRole="button"
              accessibilityLabel={continueLabel}
              style={({ pressed }) => [
                styles.continuePressable,
                pressed && canContinue && styles.pressed,
              ]}
            >
              <View style={[styles.continueButton, !canContinue && styles.continueButtonDisabled]}>
                <AppText weight="bold" style={styles.continueLabel}>
                  {continueLabel}
                </AppText>
                <Ionicons name="arrow-forward" size={18} color={palette.pureWhite} />
              </View>
            </Pressable>
          ) : null}
        </KeyboardAwareScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: palette.gold,
  },
  flex: {
    flex: 1,
  },
  hero: {
    backgroundColor: palette.gold,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
  },
  backSpacer: {
    width: 36,
    height: 36,
  },
  pressed: {
    opacity: 0.85,
  },
  sheet: {
    flex: 1,
    backgroundColor: palette.pureWhite,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    ...Platform.select({
      ios: {
        shadowColor: palette.charcoal,
        shadowOpacity: 0.08,
        shadowOffset: { width: 0, height: -4 },
        shadowRadius: 16,
      },
      android: {
        elevation: 8,
      },
      default: {},
    }),
  },
  sheetContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
  },
  continuePressable: {
    width: '100%',
    marginTop: spacing.xl,
    borderRadius: radius.pill,
  },
  continueButton: {
    backgroundColor: palette.gold,
    minHeight: 56,
    borderRadius: radius.pill,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  continueButtonDisabled: {
    opacity: 0.5,
  },
  continueLabel: {
    color: palette.pureWhite,
    fontSize: 16,
    letterSpacing: 0.3,
  },
});
