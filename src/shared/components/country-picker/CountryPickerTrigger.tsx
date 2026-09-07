import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { palette, spacing } from '@/shared/theme/tokens';
import type { Country } from '@/shared/constants/countries';

type CountryPickerTriggerProps = {
  country: Country;
  onPress: () => void;
};

export function CountryPickerTrigger({
  country,
  onPress,
}: CountryPickerTriggerProps): React.ReactElement {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.trigger, pressed && styles.pressed]}
      accessibilityRole="button"
      accessibilityLabel={`${country.name} ${country.dialCode}`}
    >
      <Text style={styles.flag}>{country.flag}</Text>
      <Text style={styles.dialCode}>{country.dialCode}</Text>
      <Ionicons name="chevron-down" size={14} color={palette.muted} />
      <View style={styles.divider} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  pressed: {
    opacity: 0.7,
  },
  flag: {
    fontSize: 18,
  },
  dialCode: {
    fontSize: 18,
    fontWeight: '600',
    color: palette.charcoal,
  },
  divider: {
    width: StyleSheet.hairlineWidth * 2,
    height: 20,
    backgroundColor: palette.softGold,
    marginLeft: spacing.xs,
  },
});
