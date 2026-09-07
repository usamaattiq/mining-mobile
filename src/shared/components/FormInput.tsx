import React from 'react';
import { StyleSheet, Text, TextInput, View, type TextInputProps } from 'react-native';
import { palette, radius, spacing } from '@/shared/theme/tokens';

type FormInputProps = TextInputProps & {
  label?: string;
  error?: string;
  leftAdornment?: React.ReactNode;
};

export function FormInput({
  label,
  error,
  leftAdornment,
  style,
  ...rest
}: FormInputProps): React.ReactElement {
  return (
    <View style={styles.container}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View style={[styles.inputRow, error ? styles.inputRowError : null]}>
        {leftAdornment}
        <TextInput style={[styles.input, style]} placeholderTextColor={palette.muted} {...rest} />
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.xs,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: palette.charcoal,
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
  },
  error: {
    fontSize: 12,
    color: palette.danger,
  },
});
