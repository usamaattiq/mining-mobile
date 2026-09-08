import React from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  type TouchableOpacityProps,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '@/shared/components/AppText';
import { palette, radius, spacing } from '@/shared/theme/tokens';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'link';

type ButtonProps = TouchableOpacityProps & {
  label: string;
  variant?: ButtonVariant;
  loading?: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
};

export function Button({
  label,
  variant = 'primary',
  loading = false,
  icon,
  disabled,
  style,
  ...rest
}: ButtonProps): React.ReactElement {
  const isDisabled = disabled || loading;
  const iconColor =
    variant === 'primary' || variant === 'secondary' ? palette.pureWhite : palette.gold;

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      disabled={isDisabled}
      style={[
        styles.base,
        variant === 'primary' && styles.primary,
        variant === 'secondary' && styles.secondary,
        variant === 'outline' && styles.outline,
        variant === 'link' && styles.link,
        isDisabled && styles.disabled,
        style,
      ]}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? palette.pureWhite : palette.gold} />
      ) : (
        <>
          {icon ? <Ionicons name={icon} size={16} color={iconColor} /> : null}
          <AppText
            weight="bold"
            style={[
              styles.label,
              variant === 'primary' && styles.labelPrimary,
              variant === 'secondary' && styles.labelSecondary,
              variant === 'outline' && styles.labelOutline,
              variant === 'link' && styles.labelLink,
            ]}
          >
            {label}
          </AppText>
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
