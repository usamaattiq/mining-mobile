import React from 'react';
import { Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
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
  const [focused, setFocused] = React.useState(false);
  const digits = Array.from({ length }, (_, index) => value[index] ?? '');

  return (
    <Pressable
      style={[styles.container, disabled && styles.containerDisabled]}
      onPress={() => inputRef.current?.focus()}
      disabled={disabled}
      accessibilityRole="none"
    >
      <View style={styles.row} pointerEvents="none">
        {digits.map((digit, index) => (
          <View
            key={index}
            style={[styles.box, focused && index === value.length && styles.boxActive]}
          >
            <Text style={styles.digitText}>{digit ? (secure ? '•' : digit) : ''}</Text>
          </View>
        ))}
      </View>

      <TextInput
        ref={inputRef}
        style={styles.realInput}
        value={value}
        onChangeText={(text) => onChangeValue(text.replace(/[^0-9]/g, '').slice(0, length))}
        keyboardType="number-pad"
        inputMode="numeric"
        maxLength={length}
        autoFocus={autoFocus && !disabled}
        editable={!disabled}
        caretHidden
        selectTextOnFocus={false}
        autoComplete={secure ? 'off' : Platform.OS === 'android' ? 'sms-otp' : 'one-time-code'}
        textContentType={secure ? 'none' : 'oneTimeCode'}
        importantForAutofill={secure ? 'no' : 'yes'}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  containerDisabled: {
    opacity: 0.5,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.sm,
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
  digitText: {
    fontSize: 22,
    fontWeight: '700',
    color: palette.charcoal,
    textAlign: 'center',
  },
  realInput: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.02,
    color: 'transparent',
  },
});
