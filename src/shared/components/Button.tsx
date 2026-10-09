import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { AppText } from '@/shared/components/AppText';
import { palette, radius, spacing } from '@/theme';
import type { ButtonProps } from '@/shared/types/button.types';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function Button({
  label,
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  iconPosition = 'left',
  overlay,
  disabled,
  style,
  ...rest
}: ButtonProps): React.ReactElement {
  const isDisabled = disabled || loading;
  const iconColor = variant === 'outline' || variant === 'link' ? palette.gold : palette.pureWhite;
  const iconElement = icon ? <Ionicons name={icon} size={16} color={iconColor} /> : null;
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      {...rest}
      disabled={isDisabled}
      onPressIn={(event) => {
        scale.value = withTiming(0.97, { duration: 90 });
        rest.onPressIn?.(event);
      }}
      onPressOut={(event) => {
        scale.value = withTiming(1, { duration: 140 });
        rest.onPressOut?.(event);
      }}
      style={[
        styles.base,
        size === 'lg' && styles.lg,
        variant === 'primary' && styles.primary,
        variant === 'secondary' && styles.secondary,
        variant === 'outline' && styles.outline,
        variant === 'link' && styles.link,
        variant === 'whatsapp' && styles.whatsapp,
        overlay ? styles.clip : null,
        isDisabled && styles.disabled,
        animatedStyle,
        style,
      ]}
    >
      {overlay}
      {loading ? (
        <ActivityIndicator
          color={variant === 'outline' || variant === 'link' ? palette.gold : palette.pureWhite}
        />
      ) : (
        <>
          {iconPosition === 'left' ? iconElement : null}
          <AppText
            weight="bold"
            style={[
              styles.label,
              size === 'lg' && styles.labelLg,
              variant === 'primary' && styles.labelPrimary,
              variant === 'secondary' && styles.labelSecondary,
              variant === 'outline' && styles.labelOutline,
              variant === 'link' && styles.labelLink,
              variant === 'whatsapp' && styles.labelPrimary,
            ]}
          >
            {label}
          </AppText>
          {iconPosition === 'right' ? iconElement : null}
        </>
      )}
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    borderRadius: radius.pill,
    paddingVertical: spacing.sm + 6,
    paddingHorizontal: spacing.lg,
  },
  lg: {
    minHeight: 56,
    borderRadius: radius.pill,
  },
  clip: {
    overflow: 'hidden',
  },
  primary: {
    backgroundColor: palette.gold,
  },
  secondary: {
    backgroundColor: palette.charcoal,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: palette.gold,
  },
  whatsapp: {
    backgroundColor: '#25D366',
  },
  link: {
    backgroundColor: 'transparent',
    paddingVertical: spacing.xs,
    paddingHorizontal: 0,
  },
  disabled: {
    opacity: 0.5,
  },
  label: {
    fontSize: 15,
  },
  labelLg: {
    fontSize: 16,
    letterSpacing: 0.3,
  },
  labelPrimary: {
    color: palette.pureWhite,
  },
  labelSecondary: {
    color: palette.pureWhite,
  },
  labelOutline: {
    color: palette.gold,
  },
  labelLink: {
    color: palette.gold,
    fontSize: 13,
  },
});
