import React from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { OnboardingHeadline } from '@/features/auth/components/OnboardingHeadline';
import { OnboardingStepper, type OnboardingStep } from '@/features/auth/components/OnboardingStepper';
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
  const footerInset = Math.max(insets.bottom, spacing.md);
  const footerOffset = showFooter ? 56 + spacing.md + footerInset : spacing.md;

  return (
    <View style={styles.root}>
      <StatusBar style="light" />

      <LinearGradient
        colors={[palette.gold, palette.lightGold]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={[styles.hero, { paddingTop: insets.top + spacing.md }]}
      >
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
        </View>

        <OnboardingHeadline title={title} subtitle={subtitle} dark />

        <OnboardingStepper steps={steps} currentStep={currentStep} />
      </LinearGradient>

      <View style={styles.sheet}>
        <KeyboardAwareScrollView
          style={styles.flex}
          contentContainerStyle={[styles.sheetContent, { paddingBottom: footerOffset }]}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          showsVerticalScrollIndicator={false}
          bottomOffset={spacing.md}
        >
          {children}
        </KeyboardAwareScrollView>

        {showFooter ? (
          <View pointerEvents="box-none" style={[styles.footer, { paddingBottom: footerInset }]}>
            <Pressable
              disabled={!canContinue}
              onPress={onContinue}
              accessibilityRole="button"
              accessibilityLabel={continueLabel}
              style={({ pressed }) => [styles.continuePressable, pressed && canContinue && styles.pressed]}
            >
              <LinearGradient
                colors={[palette.gold, palette.lightGold]}
                start={{ x: 0, y: 0.5 }}
                end={{ x: 1, y: 0.5 }}
                style={[styles.continueButton, !canContinue && styles.continueButtonDisabled]}
              >
                <Text style={styles.continueLabel}>{continueLabel}</Text>
                <Ionicons name="arrow-forward" size={18} color={palette.charcoal} />
              </LinearGradient>
            </Pressable>
          </View>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    // Matches the hero gradient's bottom color so the white sheet's rounded
    // top corners blend into the seam instead of exposing a mismatched flat
    // gold behind the cutout.
    backgroundColor: palette.lightGold,
  },
  flex: {
    flex: 1,
  },
  hero: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
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
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    backgroundColor: palette.pureWhite,
  },
  continuePressable: {
    width: '100%',
    borderRadius: radius.pill,
  },
  continueButton: {
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
    color: palette.charcoal,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});
