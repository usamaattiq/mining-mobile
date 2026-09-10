import React from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import { palette, radius, spacing } from '@/theme';
import type { CodeInputProps } from '@/shared/types/codeInput.types';

/** Shared digit-box input, used for both OTP verification and MPIN entry. */
export function CodeInput({
  length,
  value,
  onChangeValue,
  secure = false,
  autoFocus = true,
  disabled = false,
}: CodeInputProps): React.ReactElement {
  const inputRef = React.useRef<TextInput>(null);
  const digits = Array.from({ length }, (_, index) => value[index] ?? '');

  return (
    <View style={[styles.container, disabled && styles.containerDisabled]}>
      {digits.map((digit, index) => (
        <View
          key={index}
          style={[styles.box, index === value.length && !disabled && styles.boxActive]}
        >
          <TextInput style={styles.hiddenInput} editable={false} value="" />
          <View pointerEvents="none" style={styles.digitWrap}>
            <TextInput
              style={styles.digitText}
              editable={false}
              value={digit ? (secure ? '•' : digit) : ''}
            />
          </View>
        </View>
      ))}
      <TextInput
        ref={inputRef}
        style={styles.realInput}
        value={value}
        onChangeText={(text) => onChangeValue(text.replace(/[^0-9]/g, '').slice(0, length))}
        keyboardType="number-pad"
        maxLength={length}
        autoFocus={autoFocus && !disabled}
        editable={!disabled}
        caretHidden
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  containerDisabled: {
    opacity: 0.5,
  },
  box: {
    width: 48,
    height: 56,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: palette.softGold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  boxActive: {
    borderColor: palette.gold,
  },
  hiddenInput: {
    display: 'none',
  },
  digitWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  digitText: {
    fontSize: 22,
    fontWeight: '700',
    color: palette.charcoal,
    textAlign: 'center',
    padding: 0,
  },
  realInput: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0,
  },
});
