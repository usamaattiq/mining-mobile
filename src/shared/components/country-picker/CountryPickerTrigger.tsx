import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '@/shared/components/AppText';
import { palette, spacing } from '@/theme';
import type { CountryPickerTriggerProps } from '@/shared/types/countryPicker.types';

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
      <AppText style={styles.flag}>{country.flag}</AppText>
      <AppText weight="semibold" style={styles.dialCode}>
        {country.dialCode}
      </AppText>
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
    color: palette.charcoal,
  },
  divider: {
    width: StyleSheet.hairlineWidth * 2,
    height: 20,
    backgroundColor: palette.softGold,
    marginLeft: spacing.xs,
  },
});
