import React from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '@/shared/components/AppText';
import { palette, radius, spacing } from '@/theme';
import type { CounterFieldProps } from '@/shared/types/counterField.types';

/** Numeric stepper: minus/plus buttons around a typeable value — e.g. number of units. */
export function CounterField({
  label,
  value,
  onChange,
  min = 0,
  max,
  step = 1,
  required,
}: CounterFieldProps): React.ReactElement {
  const [text, setText] = React.useState(String(value));

  React.useEffect(() => {
    setText(String(value));
  }, [value]);

  const clamp = (next: number) => {
    let clamped = Math.max(min, next);
    if (max !== undefined) clamped = Math.min(max, clamped);
    return clamped;
  };

  const handleDecrement = () => onChange(clamp(value - step));
  const handleIncrement = () => onChange(clamp(value + step));

  const handleChangeText = (next: string) => {
    const digitsOnly = next.replace(/[^0-9]/g, '');
    setText(digitsOnly);
  };

  const handleBlur = () => {
    const parsed = Number.parseInt(text, 10);
    const next = clamp(Number.isNaN(parsed) ? min : parsed);
    onChange(next);
    setText(String(next));
  };

  const decrementDisabled = value <= min;
  const incrementDisabled = max !== undefined && value >= max;

  return (
    <View style={styles.container}>
      {label ? (
        <AppText weight="semibold" style={styles.label}>
          {label}
          {required ? <AppText style={styles.required}> *</AppText> : null}
        </AppText>
      ) : null}
      <View style={styles.row}>
        <Pressable
          onPress={handleDecrement}
          disabled={decrementDisabled}
          style={({ pressed }) => [
            styles.button,
            decrementDisabled && styles.buttonDisabled,
            pressed && !decrementDisabled && styles.pressed,
          ]}
          accessibilityRole="button"
          accessibilityLabel="Decrease"
        >
          <Ionicons name="remove" size={18} color={palette.pureWhite} />
        </Pressable>

        <TextInput
          value={text}
          onChangeText={handleChangeText}
          onBlur={handleBlur}
          keyboardType="numeric"
          style={styles.input}
          textAlign="center"
        />

        <Pressable
          onPress={handleIncrement}
          disabled={incrementDisabled}
          style={({ pressed }) => [
            styles.button,
            incrementDisabled && styles.buttonDisabled,
            pressed && !incrementDisabled && styles.pressed,
          ]}
          accessibilityRole="button"
          accessibilityLabel="Increase"
        >
          <Ionicons name="add" size={18} color={palette.pureWhite} />
        </Pressable>
      </View>
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
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  button: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: palette.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabled: {
    opacity: 0.4,
  },
  pressed: {
    opacity: 0.85,
  },
  input: {
    flex: 1,
    height: 44,
    borderWidth: 1,
    borderColor: palette.softGold,
    borderRadius: radius.md,
    fontSize: 16,
    color: palette.charcoal,
  },
});
