import React from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import { useLanguage } from '@/i18n/hooks/useLanguage';
import { AppText } from '@/shared/components/AppText';
import { palette, radius, spacing, getFontFamily } from '@/theme';
import type { FormInputProps } from '@/shared/types/formInput.types';

export function FormInput({
  label,
  required,
  error,
  leftAdornment,
  rightAdornment,
  style,
  ...rest
}: FormInputProps): React.ReactElement {
  const { currentLanguage } = useLanguage();

  return (
    <View style={styles.container}>
      {label ? (
        <AppText weight="semibold" style={styles.label}>
          {label}
          {required ? <AppText style={styles.required}> *</AppText> : null}
        </AppText>
      ) : null}
      <View style={[styles.inputRow, error ? styles.inputRowError : null]}>
        {leftAdornment}
        <TextInput
          style={[styles.input, { fontFamily: getFontFamily(currentLanguage) }, style]}
          placeholderTextColor={palette.muted}
          {...rest}
        />
        {rightAdornment}
      </View>
      {error ? <AppText style={styles.error}>{error}</AppText> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.xs,
  },
  label: {
    fontSize: 13,
    color: palette.charcoal,
  },
  required: {
    fontSize: 13,
    color: palette.danger,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: palette.softGold,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    gap: spacing.xs,
  },
  inputRowError: {
    borderColor: palette.danger,
  },
  input: {
    flex: 1,
    paddingVertical: spacing.sm + 4,
    fontSize: 15,
    color: palette.charcoal,
    textAlignVertical: 'center',
  },
  error: {
    fontSize: 12,
    color: palette.danger,
  },
});
