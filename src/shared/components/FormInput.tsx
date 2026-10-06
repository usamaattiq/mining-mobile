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
  editable,
  keyboardType,
  inputAccessoryViewID,
  maxLength,
  value,
  showCounter,
  ...rest
}: FormInputProps): React.ReactElement {
  const { currentLanguage } = useLanguage();
  const disabled = editable === false;
  const valueLength = typeof value === 'string' ? value.length : 0;
  const shouldShowCounter = Boolean(showCounter && maxLength != null);

  return (
    <View style={styles.container}>
      {label || shouldShowCounter ? (
        <View style={styles.labelRow}>
          {label ? (
            <AppText weight="semibold" style={styles.label}>
              {label}
              {required ? <AppText style={styles.required}> *</AppText> : null}
            </AppText>
          ) : (
            <View />
          )}
          {shouldShowCounter ? (
            <AppText style={styles.counter}>
              {valueLength}/{maxLength}
            </AppText>
          ) : null}
        </View>
      ) : null}
      <View
        style={[
          styles.inputRow,
          disabled && styles.inputRowDisabled,
          error ? styles.inputRowError : null,
        ]}
      >
        {leftAdornment}
        <TextInput
          style={[
            styles.input,
            { fontFamily: getFontFamily(currentLanguage) },
            disabled && styles.inputDisabled,
            style,
          ]}
          placeholderTextColor={palette.muted}
          editable={editable}
          keyboardType={keyboardType}
          inputAccessoryViewID={inputAccessoryViewID}
          maxLength={maxLength}
          value={value}
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
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  label: {
    flexShrink: 1,
    fontSize: 13,
    color: palette.charcoal,
  },
  counter: {
    fontSize: 12,
    color: palette.muted,
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
    backgroundColor: palette.pureWhite,
    minHeight: 52,
  },
  inputRowError: {
    borderColor: palette.danger,
  },
  inputRowDisabled: {
    backgroundColor: palette.softGold,
    borderColor: palette.softGold,
  },
  input: {
    flex: 1,
    paddingVertical: spacing.sm + 4,
    fontSize: 15,
    color: palette.charcoal,
    textAlignVertical: 'center',
  },
  inputDisabled: {
    color: palette.muted,
  },
  error: {
    fontSize: 12,
    color: palette.danger,
  },
});
