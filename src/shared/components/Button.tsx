import React from 'react';
import { ActivityIndicator, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '@/shared/components/AppText';
import { palette, radius, spacing } from '@/theme';
import type { ButtonProps } from '@/shared/types/button.types';

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
  const iconColor =
    variant === 'primary' || variant === 'secondary' ? palette.pureWhite : palette.gold;
  const iconElement = icon ? <Ionicons name={icon} size={16} color={iconColor} /> : null;

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      disabled={isDisabled}
      style={[
        styles.base,
        size === 'lg' && styles.lg,
        variant === 'primary' && styles.primary,
        variant === 'secondary' && styles.secondary,
        variant === 'outline' && styles.outline,
        variant === 'link' && styles.link,
        overlay ? styles.clip : null,
        isDisabled && styles.disabled,
        style,
      ]}
      {...rest}
    >
      {overlay}
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? palette.pureWhite : palette.gold} />
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
            ]}
          >
            {label}
          </AppText>
          {iconPosition === 'right' ? iconElement : null}
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    borderRadius: radius.md,
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
